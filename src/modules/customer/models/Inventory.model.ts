import { defineCollection } from "@/db"

export type InventoryLine = {
  lineNum: number
  productCode: string
  quantity: number
  expiryDate: string
  statusOption: string
}

export type Inventory = {
  _id: string
  inventoryDate: Date
  username: string
  customerCode: string
  transId: string
  lines: InventoryLine[]
}

export const InventoryModel = defineCollection<Inventory>({
  name: "InventoryModel",
  dates: ["inventoryDate"],
})
