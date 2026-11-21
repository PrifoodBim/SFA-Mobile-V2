import { defineCollection } from "@/db"

export type Demo = {
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

export const DemoModel = defineCollection<Demo>({
  name: "DemoModel",
  dates: ["docDate"],
})
