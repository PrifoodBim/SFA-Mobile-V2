import { ProductPartner } from "@/db/models/ProductPartner.model"

export type ItemProduct = ProductPartner & {
  quantity?: string
  isCheck?: boolean
  expiry?: string
  itemStatus?: string
}
