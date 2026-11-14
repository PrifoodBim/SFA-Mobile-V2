import api from "@/config/api"
import { getMonth, getYear } from "@/utils/date.utils"

export type CoverageLogsPayload = {
  customerCode: string
  coverageId: number | null
  userName: string
  logDate: Date
  latitude: string
  longitude: string
  transId: string
}

export const getCoverageList = async () => {
  const month = getMonth(new Date()) + 1
  const year = getYear(new Date())

  const resp = await api.get(`mcp?month=${month}&year=${year}`)

  return resp.data
}

export const sendCoverageLogs = async (payload: CoverageLogsPayload[]) => {
  const resp = await api.post("mcp/logs", payload)

  return resp
}
