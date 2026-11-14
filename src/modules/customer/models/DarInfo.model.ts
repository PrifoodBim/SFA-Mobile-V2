import { defineCollection } from "@/db"

export type DarInfo = {
  customerCode: string
  customerName: string
  class: string
  channel: string
  frequency: string
  paymentTerms: string
  monthlyTarget: number
  monthlyActual: number
  monthlyBalance: number
  todaysTarget: number
  todaysIndex: number
  nplData: number
  mclData: number
  mclPercent: number
  mclActual: number
  promoData: number
  listedSku: string
}

export const DarInfoModel = defineCollection<DarInfo>({
  name: "DarInfoModel",
  primaryKey: "customerCode",
})
