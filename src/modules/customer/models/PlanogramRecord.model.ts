import { defineCollection } from "@/db"

export type PlanogramRecord = {
  _id: string
  planoDate: string
  planogramCode: string
  username: string
  customerCode: string
  transId: string
  groupCode: string
  imageBefore: string
  imageAfter: string
}

export const PlanogramRecordModel = defineCollection<PlanogramRecord>({
  name: "PlanogramRecordModel",
})

export type Planogram = {
  _id: string
  code: string
  name: string
  docDate: Date
  areaCode: string
  areaName: string
  groupCode: string
  groupName: string
  status: string
  statusName: string
  imageFileObjectId: string
  fileData: string
  updatedAt: string
}

export const PlanogramModel = defineCollection<Planogram>({
  name: "PlanogramModel",
  dates: ["docDate"],
})
