import api from "@/config/api"
import { AuthPayload, AuthResponse } from "@/types/auth.type"

export const loginAuth = async (
  payload: AuthPayload,
): Promise<AuthResponse> => {
  const resp = await api.post("auth/token", payload)

  return resp.data
}
