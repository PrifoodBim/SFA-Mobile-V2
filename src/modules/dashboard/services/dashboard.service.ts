import api from "@/config/api"

export const getDashboardData = async () => {
  const resp = await api.get("dashboard")

  return resp.data
}
