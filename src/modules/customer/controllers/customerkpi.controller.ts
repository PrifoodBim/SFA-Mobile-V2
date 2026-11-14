import { upsert, write } from "@/db"
import { CustomerKpiModel } from "../models/CustomerKpi.model"
import { getCustomerKpi } from "../services/customer.service"
import { createLogger } from "@/utils/logger"

const log = createLogger("Sync:CustomerKPI")

export const syncKpiData = async (setError: (error: string) => void) => {
  try {
    const respData = await getCustomerKpi()

    write(() => {
      respData.forEach(val => upsert(CustomerKpiModel, val))
    })
  } catch (error) {
    log.error("Failed to sync Customer KPI", error)
    setError("Failed to sync Customer KPI")
  }
  return true
}
