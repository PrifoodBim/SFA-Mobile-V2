export type CustomerNotePayload = {
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

export type CustomerNoteResponse = {
  success: true
  errorMessage: string
  notesNo: number
  transId: string
}
