import api from "@/config/api"
import { OptionResponse } from "../types/Option.type"

export const getInventoryOption = async (): Promise<OptionResponse[]> => {
  const resp = await api.get("options/inventory-status")
  return resp.data.items
}

export const getPlanogramGroups = async (): Promise<OptionResponse[]> => {
  const resp = await api.get("options/planogram-groups")
  return resp.data.items
}
