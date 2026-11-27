import api from "@/config/api"

export async function getSettingsApi() {
  const resp = await api.get("settings")

  return resp.data
}
