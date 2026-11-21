import { mapLimit, UPLOAD_CONCURRENCY } from "@/utils/async.utils"
import { Logger } from "@/utils/logger"

type PendingRecord = {
  _id: string
  customerCode?: string
}

/**
 * Uploads every pending record (a few at a time), one failure doesn't stop the others.
 * Logs each failed record (id, customer, error) and the totals.
 * Returns the number of records that failed.
 */
export async function uploadPending<T extends PendingRecord>(
  log: Logger,
  records: T[],
  uploadOne: (record: T) => Promise<unknown>,
): Promise<number> {
  if (records.length === 0) {
    log.info("Nothing to upload")
    return 0
  }
  log.info(`Uploading ${records.length} record(s)`)

  const results = await mapLimit(records, UPLOAD_CONCURRENCY, async record => {
    try {
      await uploadOne(record)
      return true
    } catch (error) {
      const customer = record.customerCode
        ? `, customer ${record.customerCode}`
        : ""
      log.error(`Upload failed for record ${record._id}${customer}`, error)
      return false
    }
  })

  const failed = results.filter(ok => !ok).length
  if (failed > 0) {
    log.warn(`${records.length - failed} uploaded, ${failed} failed`)
  } else {
    log.info(`${records.length} uploaded`)
  }
  return failed
}

/** Error text for the Data Sync list, e.g. "Osa not sync (2 of 5 failed)". */
export function failedUploadMessage(
  message: string,
  failed: number,
  total: number,
) {
  return `${message} (${failed} of ${total} failed)`
}
