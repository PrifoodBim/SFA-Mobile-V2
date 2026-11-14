import { query, update } from "@/db"
import { Delivery, DeliveryModel } from "../models/Delivery.model"
import { uploadDeliveryTransaction } from "../services/customer.service"
import { DeliveryPayload } from "../types/Delivery.type"
import {
  failedUploadMessage,
  uploadPending,
} from "@/modules/sync/uploadPending"
import { createLogger } from "@/utils/logger"

const log = createLogger("Sync:Delivery")

const handleDeliverySync = async (data: Delivery) => {
  const payload: DeliveryPayload = {
    deliveryDate: data.deliveryDate.toISOString(),
    docDate: new Date().toISOString(),
    userName: data.username,
    customerCode: data.customerCode,
    transId: data._id,
    lines: data.lines.map(val => ({
      lineNum: val.lineNum,
      productCode: val.productCode,
      quantity: val.quantity,
    })),
  }

  const response = await uploadDeliveryTransaction(payload)
  update(DeliveryModel, data._id, {
    transId: response?.deliveryNo?.toString(),
  })
}

export const syncDeliveryToServer = async (
  setError: (error: string) => void,
) => {
  try {
    const dataToSync = query(DeliveryModel, { where: { transId: "0" } })
    const failed = await uploadPending(log, dataToSync, handleDeliverySync)
    if (failed > 0) {
      setError(
        failedUploadMessage("DELIVERY not sync", failed, dataToSync.length),
      )
    }
  } catch (error) {
    log.error("DELIVERY not sync", error)
    setError("DELIVERY not sync")
  }
  return true
}
