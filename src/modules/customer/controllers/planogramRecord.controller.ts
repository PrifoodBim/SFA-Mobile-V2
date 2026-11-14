import { createId, findOne, insert, query, update, write } from "@/db"
import { imageDownload } from "@/services/image-service"
import { FileDownloadType } from "@/types/FileDownloadType"
import { getFileName } from "@/utils/image.utils"
import {
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
  formdata.append("TransId", data._id)
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

    write(() => {
      data.forEach(val => {
        const { lastModificationTime, ...planogram } = val
        const record = findOne(PlanogramModel, { where: { code: val.code } })

        if (!record) {
          insert(PlanogramModel, {
            _id: createId(),
            ...planogram,
            fileData: val.fileData || "",
            updatedAt: lastModificationTime ?? "",
          })
          files.push({
            fileId: val.imageFileObjectId,
            fileName: val.imageFileObjectId,
          })
        } else if (lastModificationTime !== record.updatedAt) {
          update(PlanogramModel, record._id, {
            status: val.status,
            imageFileObjectId: val.imageFileObjectId,
            fileData: val.fileData || "",
            updatedAt: lastModificationTime ?? "",
          })
          files.push({
            fileId: val.imageFileObjectId,
            fileName: val.imageFileObjectId,
          })
        }
      })
    })

    await Promise.all(
      files.map(val =>
        imageDownload(`files/${val.fileId}/download`, val.fileName),
      ),
    )
  } catch (error) {
    log.error("Planogram data not Sync", error)
    setError("Planogram data not Sync")
  }
  return true
}
