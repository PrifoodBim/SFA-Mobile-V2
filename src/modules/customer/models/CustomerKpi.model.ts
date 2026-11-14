import { defineCollection } from "@/db"

export type CustomerKpi = {
  customerCode: string
  customerName: string
  ytdTarget: number
  ytdSales: number
  ytdBalance: number
  mtdTarget: number
  mtdSales: number
  mtdBalance: number
  listedSKU: string
  monthlyPromo: string
  npl: number
  osaPercentage: string
  ytdBadOrder: string
  mtdBadOrder: string
}

export const CustomerKpiModel = defineCollection<CustomerKpi>({
  name: "CustomerKpiModel",
  primaryKey: "customerCode",
})
