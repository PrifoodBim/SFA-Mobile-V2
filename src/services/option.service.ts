import api from "@/config/api"

export async function getDemoGroups() {
  const resp = await api.get("options/demo-groups")

  return resp.data.items
}

export async function getMarketTypes() {
  const resp = await api.get("options/market-types")

  return resp.data.items
}
