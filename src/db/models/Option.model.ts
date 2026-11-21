import { defineCollection } from "@/db"

export type SubOption = {
  code: string
  name: string
}

export type Option = {
  _id: string
  code: string
  value: string
  type: string
  subType: SubOption[]
}

export const OptionModel = defineCollection<Option>({
  name: "OptionModel",
})
