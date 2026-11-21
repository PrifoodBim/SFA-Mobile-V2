import api from "@/config/api"

export const getProductPartners = async () => {
  const resp = await api.get("product-partners?MaxResultCount=10000")

  return resp.data
}
