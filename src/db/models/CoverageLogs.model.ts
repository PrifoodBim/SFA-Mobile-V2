import { defineCollection } from "@/db"

export type CoverageLogs = {
  _id: string
  converageLogsId: number
  customerCode: string
  coverageId: number
  userName: string
  logDate: Date
  latitude: string
  longitude: string
}

export const CoverageLogsModel = defineCollection<CoverageLogs>({
  name: "CoverageLogsModel",
  dates: ["logDate"],
})
