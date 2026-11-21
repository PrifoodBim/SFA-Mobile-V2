import { defineCollection } from "@/db"

export type Alert = {
  _id: string
  alertId: string
  alertDate: string
  alertTitle: string
  alertMessage: string
  alertStatus: string
  imageFileObjectId: string
  statusName: string
  lastModificationTime: string
  isUpdated: number
  isRead: number
  areaName: string
}

export const AlertModel = defineCollection<Alert>({
  name: "AlertModel",
})
