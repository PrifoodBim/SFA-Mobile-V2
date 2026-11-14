import { defineCollection } from "@/db"

export type CustomerNote = {
  _id: string
  transId: string
  notesDate: string
  customerCode: string
  userName: string
  cleanliness: string
  priceTags: string
  posMaterials: boolean
  concerns: string
  resolution: string
}

export const CustomerNoteModel = defineCollection<CustomerNote>({
  name: "CustomerNoteModel",
})
