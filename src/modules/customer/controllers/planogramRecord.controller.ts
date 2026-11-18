import { createId, query, toTransId, update, upsertMany, write } from "@/db"
import { imageDownload } from "@/services/image-service"
import { FileDownloadType } from "@/types/FileDownloadType"
import { getFileName } from "@/utils/image.utils"
import {
  Planogram,
  PlanogramModel,
  PlanogramRecord,
  PlanogramRecordModel,
} from "../models/PlanogramRecord.model"
import {
  getCustomerPlanogram,
  uploadPlanogramRecord,
} from "../services/customer.service"
import {
  failedUploadMessage,
  uploadPending,
} from "@/modules/sync/uploadPending"
import { DOWNLOAD_CONCURRENCY, mapLimit } from "@/utils/async.utils"
import { createLogger } from "@/utils/logger"

const log = createLogger("Sync:Planogram")

/** React Native's multipart file part (`{ uri, name, type }`), typed as the DOM `Blob` overload. */
const imagePart = (uri: string) =>
  ({ type: "image/jpeg", name: getFileName(uri), uri }) as unknown as Blob

const handlePlanogramRecordSync = async (data: PlanogramRecord) => {
  const formdata = new FormData()
  formdata.append("PlanoDate", data.planoDate)
  formdata.append("UserName", data.username)
  formdata.append("CustomerCode", data.customerCode)
  formdata.append("GroupCode", data.groupCode)
  formdata.append("TransId", toTransId(data._id))
  formdata.append("PlanogramCode", data.planogramCode)
  formdata.append("ImageBefore", imagePart(data.imageBefore))
  formdata.append("ImageAfter", imagePart(data.imageAfter))

  const resp = await uploadPlanogramRecord(formdata)
  update(PlanogramRecordModel, data._id, {
    transId: resp?.planoNo?.toString(),
  })
}

export const syncPlanogramRecordToServer = async (
  setError: (error: string) => void,
) => {
  try {
    const dataToSync = query(PlanogramRecordModel, { where: { transId: "0" } })
    const failed = await uploadPending(
      log,
      dataToSync,
      handlePlanogramRecordSync,
    )
    if (failed > 0) {
      setError(
        failedUploadMessage("Planogram not sync", failed, dataToSync.length),
      )
    }
  } catch (error) {
    log.error("Planogram not sync", error)
    setError("Planogram not sync")
  }
  return true
}

export const syncPlanogramDataFromServer = async (
  setError: (error: string) => void,
) => {
  try {
    const data = await getCustomerPlanogram()
    const files: FileDownloadType[] = []

    // One read + one bulk write instead of a full-table findOne per item.
    const byCode = new Map<string, Planogram>()
    for (const record of query(PlanogramModel)) {
      byCode.set(record.code, record)
    }

    const toWrite = new Map<string, Planogram>()
    for (const val of data) {
      const { lastModificationTime, ...planogram } = val
      const record = byCode.get(val.code)
      const updatedAt = lastModificationTime ?? ""
      let doc: Planogram

      if (!record) {
        doc = {
          _id: createId(),
          ...planogram,
          fileData: val.fileData || "",
          updatedAt,
        } as Planogram
      } else if (updatedAt !== record.updatedAt) {
        doc = {
          ...record,
          status: val.status,
          imageFileObjectId: val.imageFileObjectId,
          fileData: val.fileData || "",
          updatedAt,
        }
      } else {
        continue
      }

      byCode.set(val.code, doc)
      toWrite.set(val.code, doc)
      files.push({
        fileId: val.imageFileObjectId,
        fileName: val.imageFileObjectId,
      })
    }

    write(() => upsertMany(PlanogramModel, [...toWrite.values()]))

    await mapLimit(files, DOWNLOAD_CONCURRENCY, val =>
      imageDownload(`files/${val.fileId}/download`, val.fileName),
    )
  } catch (error) {
    log.error("Planogram data not Sync", error)
    setError("Planogram data not Sync")
  }
  return true
}
