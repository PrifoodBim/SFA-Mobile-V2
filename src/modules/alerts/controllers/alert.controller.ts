import { createId, query, update, upsertMany, write } from "@/db"
import { Alert, AlertModel } from "@/modules/alerts/models/Alert.model"
import { getAlertDataService } from "@/services/alert.service"
import { imageDownload } from "@/services/image-service"
import { DOWNLOAD_CONCURRENCY, mapLimit } from "@/utils/async.utils"
import { createLogger } from "@/utils/logger"

const log = createLogger("Sync:Alerts")

/** Alert as returned by the server. */
type AlertResponse = {
  id: number | string
  alertDate: string
  alertTitle: string
  alertMessage: string
  alertStatus: string
  imageFileObjectId: string
  statusName: string
  lastModificationTime?: string
  areaName?: string
}

/**
 * Inserts new alerts, updates changed ones and marks local alerts that the
 * server no longer returns as INACTIVE.
 */
export const syncAlertToServer = async (setError: (error: string) => void) => {
  try {
    const resp: AlertResponse[] = await getAlertDataService()

    if (!resp) {
      return true
    }

    const apiAlertIds = new Set(resp.map(item => item.id.toString()))

    // One read + one bulk write instead of a full-table findOne per alert.
    const byAlertId = new Map<string, Alert>()
    for (const alert of query(AlertModel)) {
      byAlertId.set(alert.alertId, alert)
    }
    const toWrite = new Map<string, Alert>()

    resp.forEach(item => {
      const alertId = item.id.toString()
      const fields = {
        alertDate: item.alertDate,
        alertTitle: item.alertTitle,
        alertMessage: item.alertMessage,
        alertStatus: item.alertStatus,
        imageFileObjectId: item.imageFileObjectId,
        statusName: item.statusName,
        lastModificationTime: item.lastModificationTime || "0",
        areaName: item.areaName || "",
      }
      const existing = byAlertId.get(alertId)

      if (!existing) {
        const doc: Alert = {
          _id: createId(),
          alertId,
          ...fields,
          isUpdated: 0,
          isRead: 0,
        }
        byAlertId.set(alertId, doc)
        toWrite.set(alertId, doc)
        return
      }

      const keys = Object.keys(fields) as (keyof typeof fields)[]
      if (keys.some(key => existing[key] !== fields[key])) {
        const doc: Alert = {
          ...existing,
          ...fields,
          // A new image needs downloading again.
          isUpdated:
            existing.imageFileObjectId === fields.imageFileObjectId
              ? existing.isUpdated
              : 0,
        }
        byAlertId.set(alertId, doc)
        toWrite.set(alertId, doc)
      }
    })

    for (const alert of byAlertId.values()) {
      if (!apiAlertIds.has(alert.alertId) && alert.statusName !== "INACTIVE") {
        toWrite.set(alert.alertId, { ...alert, statusName: "INACTIVE" })
      }
    }

    write(() => upsertMany(AlertModel, [...toWrite.values()]))
  } catch (error) {
    log.error("Failed to sync alert", error)
    setError("Failed to sync alert")
  }
  return true
}

/**
 * Downloads the images of alerts not yet marked as updated, then marks them
 * (`isUpdated` 1) so the same image isn't downloaded again on every sync.
 * Failed downloads stay at 0 and retry next sync.
 */
export async function alertImage(setError: (error: string) => void) {
  try {
    const alerts = query(AlertModel, { where: { isUpdated: 0 } })
    const results = await mapLimit(alerts, DOWNLOAD_CONCURRENCY, async item =>
      item.imageFileObjectId
        ? imageDownload(
            `files/${item.imageFileObjectId}/download`,
            item.imageFileObjectId,
          )
        : "no-image",
    )
    write(() => {
      alerts.forEach((alert, index) => {
        if (results[index]) {
          update(AlertModel, alert._id, { isUpdated: 1 })
        }
      })
    })
    const failed = results.filter(path => !path).length
    if (failed > 0) {
      log.warn(`Alert images: ${failed} of ${alerts.length} failed`)
    }
  } catch (error) {
    log.error("Failed to download alert image", error)
    setError("Failed to download alert image")
  }
  return true
}
