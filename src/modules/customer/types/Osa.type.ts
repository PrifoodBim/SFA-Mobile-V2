export type OsaLinePayload = {
  lineNum: number
  productCode: string
  osaTag: boolean
  highSRP: number
}

export type OsaPayload = {
  osaDate: string
  userName: string
  customerCode: string
  transId: string
  lines: OsaLinePayload[]
}

export type OsaResponse = {
  osaNo: number
  transId: string
  success: boolean
  errorMessage: string | null
}
