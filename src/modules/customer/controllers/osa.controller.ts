import { findById, query, update } from "@/db"
import { Osa, OsaModel } from "../models/Osa.model"
import { uploadOsaTransaction } from "../services/osa.service"
import { OsaPayload } from "../types/Osa.type"
import {
  failedUploadMessage,
  uploadPending,
} from "@/modules/sync/uploadPending"
import { createLogger } from "@/utils/logger"

const log = createLogger("Sync:OSA")

/**
 * The OSA saved in the current unfinished customer visit while it is not yet
 * synced; saving again updates it instead of creating a new record.
 */
export const getPendingOsaTransaction = (
  transactionId?: string | null,
): Osa | null => {
  if (!transactionId) {
    return null
  }
  const record = findById(OsaModel, transactionId)
  return record && record.transId === "0" ? record : null
}

const handleOsaSync = async (data: Osa) => {
  const payload: OsaPayload = {
    osaDate: data.osaDate,
    userName: data.username,
    customerCode: data.customerCode,
    transId: data._id,
    lines: data.lines.map(val => ({
      lineNum: val.lineNum,
      productCode: val.productCode,
      osaTag: val.osaTag,
      highSRP: val.highSrp,
    })),
  }

  const response = await uploadOsaTransaction(payload)
  update(OsaModel, data._id, { transId: response?.osaNo?.toString() })
}

export const syncOsaToServer = async (setError: (error: string) => void) => {
  try {
    const dataToSync = query(OsaModel, { where: { transId: "0" } })
    const failed = await uploadPending(log, dataToSync, handleOsaSync)
    if (failed > 0) {
      setError(failedUploadMessage("Osa not sync", failed, dataToSync.length))
    }
  } catch (error) {
    log.error("Osa not sync", error)
    setError("Osa not sync")
  }
  return true
}
