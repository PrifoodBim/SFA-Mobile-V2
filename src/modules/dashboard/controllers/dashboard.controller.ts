import { createId, findOne, upsert } from "@/db"
import { DashboardReportModel } from "@/modules/dashboard/models/DashboardReport.model"
import { getDashboardData } from "@/modules/dashboard/services/dashboard.service"
import { createLogger } from "@/utils/logger"

const log = createLogger("Sync:Dashboard")

/** Pulls the dashboard figures into the single local DashboardReport record. */
export const syncDashboardToServer = async (
  setError: (error: string) => void,
) => {
  try {
    const resp = await getDashboardData()

    if (!resp) {
      return true
    }

    const current = findOne(DashboardReportModel)
    upsert(DashboardReportModel, { id: current?.id ?? createId(), ...resp })
  } catch (error) {
    log.error("Failed to sync dashboard", error)
    setError("Failed to sync dashboard")
  }
  return true
}
