import { DarInfo } from "@/modules/customer/models/DarInfo.model"

export type UploadDarPayloadType = {
  transId: string
  /** ISO date string */
  darDate: string
  customerCode: string
  userName: string
  monthTarget: number
  monthActual: number
  monthBalance: number
  todayTarget: number
  todayActual: number
  todayIndex: number
  npl: string
  mcl: string
  promo: string
  planogram: boolean
  pricing: boolean
  isPromo: boolean
  issues: string
  action: string
  listedSku: string
}

export type UploadDarResponseType = {
  success: boolean
  errorMessage: string
  darNo: number
  transId: string
}

/** DAR info as returned by `GET customers/dar-info`. */
export type DarInfoResponse = Omit<
  DarInfo,
  "listedSku" | "channel" | "frequency" | "paymentTerms"
> & {
  listedSKU: string | null
  channel: string | null
  frequency: string | null
  paymentTerms: string | null
}
