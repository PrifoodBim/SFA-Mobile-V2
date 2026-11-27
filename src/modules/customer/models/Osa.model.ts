import { defineCollection } from "@/db"

export type OsaLine = {
  lineNum: number
  productCode: string
  osaTag: boolean
  highSrp: number
}

export type Osa = {
  _id: string
  username: string
  customerCode: string
  transId: string
  osaDate: string
  lines: OsaLine[]
}

export const OsaModel = defineCollection<Osa>({
  name: "OsaModel",
})
