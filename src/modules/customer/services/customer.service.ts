import api, { UPLOAD_TIMEOUT } from "@/config/api"
import { CsRecordPayload, CsRecordResponse } from "../types/CsRecord.type"
import {
  DarInfoResponse,
  UploadDarPayloadType,
  UploadDarResponseType,
} from "../types/Dar.type"
import { DeliveryPayload, DeliveryResponse } from "../types/Delivery.type"
import { InventoryPayload, InventoryResponse } from "../types/Inventory.type"
import { CustomerNotePayload, CustomerNoteResponse } from "../types/Notes.type"
import {
  PlanogramRecordResponse,
  PlanogramResponse,
} from "../types/PlanogramRecord.type"
import { CustomerKpi } from "../models/CustomerKpi.model"

export const uploadDeliveryTransaction = async (
  payload: DeliveryPayload,
): Promise<DeliveryResponse> => {
  const response = await api.post("delivery-record", payload)
  return response.data
}

export const uploadInventoryTransaction = async (
  payload: InventoryPayload,
): Promise<InventoryResponse> => {
  const resp = await api.post("inventory-record", payload)
  return resp.data
}

export const uploadPlanogramRecord = async (
  payload: FormData,
): Promise<PlanogramRecordResponse> => {
  const resp = await api.post("planogram-record", payload, {
    timeout: UPLOAD_TIMEOUT,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return resp.data
}

export const getCustomerPlanogram = async (): Promise<PlanogramResponse[]> => {
  const resp = await api.get("planograms?MaxResultCount=2000")
  return resp.data.items
}

export const uploadCustomerNotes = async (
  payload: CustomerNotePayload,
): Promise<CustomerNoteResponse> => {
  const resp = await api.post("notes-record", payload)
  return resp.data
}

export const getCustomerKpi = async (): Promise<CustomerKpi[]> => {
  const resp = await api.get("customers/kpi")
  return resp.data.items
}

export const getDarData = async (): Promise<DarInfoResponse[]> => {
  const resp = await api.get("customers/dar-info")
  return resp.data.items
}

export const syncDarUpload = async (
  payload: UploadDarPayloadType,
): Promise<UploadDarResponseType> => {
  const resp = await api.post("dar-record", payload)
  return resp.data
}

export const uploadCsRecord = async (
  payload: CsRecordPayload,
): Promise<CsRecordResponse> => {
  const resp = await api.post("cs-record", payload)
  return resp.data
}
