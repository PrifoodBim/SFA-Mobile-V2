import { CsRecord } from "@/modules/customer/models/CsRecord.model"

export type CsRecordPayload = Omit<CsRecord, "_id">

export type CsRecordResponse = {
  csNo: number
}
