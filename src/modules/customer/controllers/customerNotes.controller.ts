import { query, update } from "@/db"
import { CustomerNote, CustomerNoteModel } from "../models/CustomerNote.model"
import { uploadCustomerNotes } from "../services/customer.service"
import { CustomerNotePayload } from "../types/Notes.type"
import {
  failedUploadMessage,
  uploadPending,
} from "@/modules/sync/uploadPending"
import { createLogger } from "@/utils/logger"

const log = createLogger("Sync:CustomerNotes")

const handleCustomerNotesSync = async (data: CustomerNote) => {
  const payload: CustomerNotePayload = {
    transId: data._id,
    notesDate: data.notesDate,
    customerCode: data.customerCode,
    userName: data.userName,
    cleanliness: data.cleanliness,
    priceTags: data.priceTags,
    posMaterials: data.posMaterials,
    concerns: data.concerns,
    resolution: data.resolution,
  }

  const response = await uploadCustomerNotes(payload)
  update(CustomerNoteModel, data._id, {
    transId: response?.notesNo?.toString(),
  })
}

export const syncCustomerNotesToServer = async (
  setError: (error: string) => void,
) => {
  try {
    const dataToSync = query(CustomerNoteModel, { where: { transId: "0" } })
    const failed = await uploadPending(log, dataToSync, handleCustomerNotesSync)
    if (failed > 0) {
      setError(
        failedUploadMessage(
          "Failed to sync customer notes",
          failed,
          dataToSync.length,
        ),
      )
    }
  } catch (error) {
    log.error("Failed to sync customer notes", error)
    setError("Failed to sync customer notes")
  }
  return true
}
