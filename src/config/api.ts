import axios from "axios"
import { AuthResponse } from "@/types/auth.type"
import { getDataFromStorage, KEY } from "@/utils/storage.utils"

export const baseURL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://prifoodonline.com/api/"

const api = axios.create({ baseURL })

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
