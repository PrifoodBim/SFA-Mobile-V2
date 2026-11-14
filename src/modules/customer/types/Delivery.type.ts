export type DeliveryLinePayload = {
  lineNum: number
  productCode: string
  quantity: number
}

export type DeliveryPayload = {
  deliveryDate: string
  userName: string
  customerCode: string
  transId: string
  docDate: string
  lines: DeliveryLinePayload[]
}

export type DeliveryResponse = {
  deliveryNo: number
  transId: string
  success: boolean
  errorMessage: string
}
