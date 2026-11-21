import { defineCollection } from "@/db"

export type Dar = {
  _id: string
  transId: string
  darDate: string
  customerCode: string
  userName: string
  monthTarget: number
  monthActual: number
  monthBalance: number
  todayTarget: number
  todayActual: number
  todayIndex: number
  npi: string
  mcl: string
  promo: string
  planogram: boolean
  pricing: boolean
  isPromo: boolean
  issues: string
  action: string
  listedSku: string
}

export const DarModel = defineCollection<Dar>({
  name: "DarModel",
})
