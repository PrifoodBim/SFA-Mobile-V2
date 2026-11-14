import api from "@/config/api"
import { OsaPayload, OsaResponse } from "../types/Osa.type"

export const uploadOsaTransaction = async (
  payload: OsaPayload,
): Promise<OsaResponse> => {
  const response = await api.post("osa-record", payload)
  return response.data
}
