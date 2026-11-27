import { defineCollection } from "@/db"

export type ProductPartner = {
  _id: string
  productPartnerId: number
  customerCode: string
  customerName: string
  lineNum: number
  mustCarry: boolean
  productCode: string
  productName: string
  purchasePrice: number
  purchaseUOM: string
  sellingPrice: number
  sellingUOM: string
  status: string
  xCode: string
  xName: string
  packingType: string
  lastModificationTime: string
  isUpdated: number
  schemeNo: number
  ico: number
}

export const ProductPartnerModel = defineCollection<ProductPartner>({
  name: "ProductPartnerModel",
})
