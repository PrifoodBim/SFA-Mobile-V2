import axios from "axios"
import { AuthResponse } from "@/types/auth.type"
import { getDataFromStorage, KEY } from "@/utils/storage.utils"

export const baseURL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://prifoodonline.com/api/"

/** Default request timeout, so a hung request can't stall the sync forever. */
export const REQUEST_TIMEOUT = 60_000
/** Multipart uploads with photos get more time. */
export const UPLOAD_TIMEOUT = 180_000

const api = axios.create({ baseURL, timeout: REQUEST_TIMEOUT })

api.interceptors.request.use(async config => {
  try {
    const auth = await getDataFromStorage<AuthResponse>(KEY.AUTHTOKEN)
    if (auth?.accessToken) {
      config.headers.Authorization = `Bearer ${auth.accessToken}`
    }
  } catch (error) {
    console.error("Error retrieving token:", error)
  }
  return config
})

export default api
