import { defineCollection } from "@/db"

export type Product = {
  _id: string
  code: string
  name: string
  lastModificationTime: string
  statusCode: string
  statusName: string
  isUpdated: number
}

export const ProductModel = defineCollection<Product>({
  name: "ProductModel",
})
