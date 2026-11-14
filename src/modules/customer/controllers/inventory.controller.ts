import { query, update } from "@/db"
import { Inventory, InventoryModel } from "../models/Inventory.model"
import { uploadInventoryTransaction } from "../services/customer.service"
import { InventoryPayload } from "../types/Inventory.type"
import {
  failedUploadMessage,
  uploadPending,
} from "@/modules/sync/uploadPending"
import { createLogger } from "@/utils/logger"

const log = createLogger("Sync:Inventory")

const handleInventorySync = async (data: Inventory) => {
  const payload: InventoryPayload = {
    inventoryDate: data.inventoryDate.toISOString(),
    docDate: new Date().toISOString(),
    userName: data.username,
    customerCode: data.customerCode,
    transId: data._id,
    lines: data.lines.map(val => ({
      lineNum: val.lineNum,
      productCode: val.productCode,
      quantity: val.quantity,
      expiryDate: val.expiryDate,
      statusOption: val.statusOption,
    })),
  }

  const response = await uploadInventoryTransaction(payload)
  update(InventoryModel, data._id, {
    transId: response?.inventoryNo?.toString(),
  })
}

export const syncInventoryToServer = async (
  setError: (error: string) => void,
) => {
  try {
    const dataToSync = query(InventoryModel, { where: { transId: "0" } })
    const failed = await uploadPending(log, dataToSync, handleInventorySync)
    if (failed > 0) {
      setError(
        failedUploadMessage("Inventory not sync", failed, dataToSync.length),
      )
    }
  } catch (error) {
    log.error("Inventory not sync", error)
    setError("Inventory not sync")
  }
  return true
}
