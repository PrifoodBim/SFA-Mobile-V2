import { createId, findOne, insert, query, update, write } from "@/db"
import { AlertModel } from "@/modules/alerts/models/Alert.model"
import { getAlertDataService } from "@/services/alert.service"
import { imageDownload } from "@/services/image-service"
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

    write(() => {
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
        const existing = findOne(AlertModel, { where: { alertId } })

        if (!existing) {
          insert(AlertModel, {
            _id: createId(),
            alertId,
            ...fields,
            isUpdated: 0,
            isRead: 0,
          })
          return
        }

        const keys = Object.keys(fields) as (keyof typeof fields)[]
        if (keys.some(key => existing[key] !== fields[key])) {
          update(AlertModel, existing._id, fields)
        }
      })

      query(AlertModel, {
        filter: alert => !apiAlertIds.has(alert.alertId),
      }).forEach(alert => {
        update(AlertModel, alert._id, { statusName: "INACTIVE" })
      })
    })
  } catch (error) {
    log.error("Failed to sync alert", error)
    setError("Failed to sync alert")
  }
  return true
}

/** Downloads the images of alerts not yet marked as updated. */
export async function alertImage(setError: (error: string) => void) {
  try {
    const alerts = query(AlertModel, { where: { isUpdated: 0 } })
    await Promise.all(
      alerts.map(item =>
        imageDownload(
          `files/${item.imageFileObjectId}/download`,
          item.imageFileObjectId,
        ),
      ),
    )
  } catch (error) {
    log.error("Failed to download alert image", error)
    setError("Failed to download alert image")
  }
  return true
}
