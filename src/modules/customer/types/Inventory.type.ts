export type InventoryLinePayload = {
  lineNum: number
  productCode: string
  quantity: number
  expiryDate: string
  statusOption: string
}

export type InventoryPayload = {
  inventoryDate: string
  userName: string
  customerCode: string
  transId: string
  docDate: string
  lines: InventoryLinePayload[]
}

export type InventoryResponse = {
  inventoryNo: number
  transId: string
  success: boolean
  errorMessage: string
}
