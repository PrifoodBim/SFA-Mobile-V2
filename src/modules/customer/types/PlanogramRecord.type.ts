import { Planogram } from "@/modules/customer/models/PlanogramRecord.model"

export type PlanogramRecordResponse = {
  planoNo: number
  transId: string
  success: boolean
  errorMessage: string | null
}

/** Planogram as returned by `GET planograms`. */
export type PlanogramResponse = Omit<Planogram, "_id" | "updatedAt"> & {
  lastModificationTime?: string
}
