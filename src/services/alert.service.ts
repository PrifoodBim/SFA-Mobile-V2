import api from "@/config/api"

export const getAlertDataService = async () => {
  const resp = await api.get("alerts")

  return resp.data.items
}
