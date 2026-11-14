import api from "@/config/api"

export const getAllProducts = async () => {
  const resp = await api.get("products?MaxResultCount=2000")

  return resp.data
}
