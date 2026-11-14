import { defineCollection } from "@/db"

export type CsLines = {
  lineNum: number
  productCode: string
  begBal: number
  delivery: number
  endingInventory: number
  ico: number
  offtake: number
  suggested: number
}

export type CsRecord = {
  _id: string
  csDate: string
  userName: string
  customerCode: string
  transId: string
  lines: CsLines[]
}

export const CsRecordModel = defineCollection<CsRecord>({
  name: "CsRecordModel",
})
