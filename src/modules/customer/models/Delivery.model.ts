import { defineCollection } from "@/db"

export type DeliveryLine = {
  lineNum: number
  productCode: string
  quantity: number
}

export type Delivery = {
  _id: string
  deliveryDate: Date
  username: string
  customerCode: string
  transId: string
  lines: DeliveryLine[]
}

export const DeliveryModel = defineCollection<Delivery>({
  name: "DeliveryModel",
  dates: ["deliveryDate"],
})
