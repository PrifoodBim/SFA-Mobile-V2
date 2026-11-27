import { query, toTransId, update } from "@/db"
import { CsRecord, CsRecordModel } from "../models/CsRecord.model"
import { uploadCsRecord } from "../services/customer.service"
import {
  failedUploadMessage,
  uploadPending,
} from "@/modules/sync/uploadPending"
import { createLogger } from "@/utils/logger"

const log = createLogger("Sync:SuggestedOrder")

const handleCsRecordSync = async (data: CsRecord) => {
  const resp = await uploadCsRecord({
    csDate: data.csDate,
    userName: data.userName,
    customerCode: data.customerCode,
    transId: toTransId(data._id),
    lines: data.lines.map(val => ({
      lineNum: val.lineNum,
      productCode: val.productCode,
      begBal: val.begBal,
      delivery: val.delivery,
      endingInventory: val.endingInventory,
      ico: val.ico,
      offtake: val.offtake,
      suggested: val.suggested,
    })),
  })

  update(CsRecordModel, data._id, { transId: resp?.csNo?.toString() })
}

export const syncCsRecordToServer = async (
  setError: (error: string) => void,
) => {
  try {
    const dataToSync = query(CsRecordModel, { where: { transId: "0" } })
    const failed = await uploadPending(log, dataToSync, handleCsRecordSync)
    if (failed > 0) {
      setError(
        failedUploadMessage("CS Record not sync", failed, dataToSync.length),
      )
    }
  } catch (error) {
    log.error("CS Record not sync", error)
    setError("CS Record not sync")
  }
  return true
}
