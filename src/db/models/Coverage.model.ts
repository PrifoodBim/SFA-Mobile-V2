import { defineCollection } from "@/db"

export type Coverage = {
  _id: string
  coverageId: number
  userName: string
  empId: string
  empName: string
  position: string
  coverageDate: Date
  customerCode: string
  customerName: string
  priority: number
  planned: boolean
  isVisited: number
  status: string
  createDate: Date
  createBy: string
  updatedDate: Date
  updatedBy: string
}

export const CoverageModel = defineCollection<Coverage>({
  name: "CoverageModel",
  dates: ["coverageDate", "createDate", "updatedDate"],
})
