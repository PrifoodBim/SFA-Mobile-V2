import { defineCollection } from "@/db"

export type MarketAnalysisImageDetails = {
  fileName: string
  latitude: string
  longitude: string
}

export type MarketAnalysis = {
  _id: string
  docDate: string
  docId: number
  userName: string
  customerCode: string
  type: string
  title: string
  brand: string
  scheme: string
  price: string
  remarks: string
  images: string[]
  imageDetails: MarketAnalysisImageDetails[]
}

export const MarketAnalysisModel = defineCollection<MarketAnalysis>({
  name: "MarketAnalysisModel",
})
