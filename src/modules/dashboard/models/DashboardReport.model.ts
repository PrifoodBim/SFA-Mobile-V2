import { defineCollection } from "@/db"

export type DashboardReport = {
  id: string
  ytdTarget: number
  ytdSales: number
  ytdBalance: number
  mtdTarget: number
  mtdSales: number
  mtdBalance: number
  monthlyCoverageTarget: number
  monthlyCoverageCompleted: number
  dailyCoverageTarget: number
  dailyCoverageCompleted: number
}

export const DashboardReportModel = defineCollection<DashboardReport>({
  name: "DashboardReportModel",
  primaryKey: "id",
})
