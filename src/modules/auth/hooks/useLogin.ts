import { isAxiosError } from "axios"
import { router } from "expo-router"
import { Route } from "@/constants/routes"
import { alert, hideLoading } from "@/lib/modal"
import { loginAuth } from "@/services/auth.service"
import { AuthPayload, AuthResponse, StorageAuthType } from "@/types/auth.type"
import { LatLng } from "@/types/location.type"
import { configAuthDate } from "@/utils/date.utils"
import { KEY, saveStorage } from "@/utils/storage.utils"

export default function useLogin() {
  async function getAuth(
    payload: AuthPayload,
    location: LatLng,
    clearData: () => void,
  ) {
    try {
      const resp: AuthResponse = await loginAuth(payload)

      const storageData: StorageAuthType = {
        ...resp,
        ...location,
        expiryDate: configAuthDate(resp.expireInSeconds).toString(),
      }

      await saveStorage(KEY.AUTHTOKEN, storageData)
      clearData()

      hideLoading()
      router.replace(Route.LOADING)
    } catch (error) {
      console.error(error)
      const data = isAxiosError(error) ? error.response?.data : undefined
      await alert({
        title: "Sign In Failed",
        message: data ? String(data) : "Invalid user id or password.",
        singleButtonText: "Retry",
      })
    }
  }

  return { getAuth }
}
