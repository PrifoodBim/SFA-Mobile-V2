import api from "@/config/api"

export const getCustomers = async () => {
  const resp = await api.get("customers?MaxResultCount=1000")

  return resp.data
}
