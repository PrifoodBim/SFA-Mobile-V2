import { defineCollection } from "@/db"

export type MapsSettings = {
  _id: string
  customerColor: string
  visitedColor: string
  employeeColor: string
  employeeMissedColor: string
  supervisorColor: string
  circleColor: string
  hitRadius: number
}

export const MapsSettingsModel = defineCollection<MapsSettings>({
  name: "MapsSettingsModel",
})
