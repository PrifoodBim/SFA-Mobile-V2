import { findById, insert, query, toTransId, update, upsert, write } from "@/db"
import { Dar, DarModel } from "../models/Dar.model"
import { DarInfoModel } from "../models/DarInfo.model"
import { getDarData, syncDarUpload } from "../services/customer.service"
import { UploadDarPayloadType } from "../types/Dar.type"
import {
  failedUploadMessage,
  uploadPending,
} from "@/modules/sync/uploadPending"
import { createLogger } from "@/utils/logger"

const log = createLogger("Sync:DAR")

export const syncDarInfoFromServer = async (
  setError: (error: string) => void,
) => {
  try {
    const resp = await getDarData()

    write(() => {
      resp.forEach(val => {
        const { listedSKU, ...rest } = val

        if (findById(DarInfoModel, val.customerCode)) {
          upsert(DarInfoModel, {
            ...rest,
            listedSku: listedSKU || "",
            channel: val.channel || "",
            frequency: val.frequency || "",
            paymentTerms: val.paymentTerms || "",
          })
        } else {
          insert(DarInfoModel, {
            ...rest,
            listedSku: listedSKU ?? "EMPTY",
            channel: val.channel ?? "EMPTY",
            frequency: val.frequency ?? "EMPTY",
            paymentTerms: val.paymentTerms ?? "EMPTY",
          })
        }
      })
    })
  } catch (error) {
    log.error("Failed to sync dar info", error)
    setError("Failed to sync dar info")
  }
  return true
}

const handleUploadedDar = async (data: Dar) => {
  const payload: UploadDarPayloadType = {
    transId: toTransId(data._id),
    darDate: data.darDate,
    customerCode: data.customerCode,
    userName: data.userName,
    monthTarget: data.monthTarget,
    monthActual: data.monthActual,
    monthBalance: data.monthBalance,
    todayTarget: data.todayTarget,
    todayActual: data.todayActual,
    todayIndex: data.todayIndex,
    npl: data.npi,
    mcl: data.mcl,
    promo: data.promo,
    planogram: data.planogram,
    pricing: data.pricing,
    isPromo: data.isPromo,
    issues: data.issues,
    action: data.action,
    listedSku: data.listedSku,
  }

  const response = await syncDarUpload(payload)
  update(DarModel, data._id, { transId: response?.darNo.toString() })
}

export const syncDarUploadToServer = async (
  setError: (error: string) => void,
) => {
  try {
    const dataToSync = query(DarModel, { where: { transId: "0" } })
    const failed = await uploadPending(log, dataToSync, handleUploadedDar)
    if (failed > 0) {
      setError(failedUploadMessage("DSR not sync", failed, dataToSync.length))
    }
  } catch (error) {
    log.error("DAR not sync", error)
    setError("DSR not sync")
  }
  return true
}
