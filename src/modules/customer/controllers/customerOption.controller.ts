import { saveOptions } from "@/modules/sync/services/sync.service"
import { OptionTypeEnum } from "@/types/Option.type"
import {
  getInventoryOption,
  getPlanogramGroups,
} from "../services/customerOption.service"
import { createLogger } from "@/utils/logger"

const log = createLogger("Sync:Options")

export async function handleInventoryStatusOption(
  setError: (error: string) => void,
) {
  try {
    const items = await getInventoryOption()

    // Only adds missing statuses, like before.
    saveOptions(OptionTypeEnum.INVENTORY_STATUS, items, {
      updateExisting: false,
    })
  } catch (error) {
    log.error("Inventory Status not sync", error)
    setError("Inventory Status not sync")
  }
  return true
}

export async function handlePlanogramGroupsOption(
  setError: (error: string) => void,
) {
  try {
    const items = await getPlanogramGroups()

    saveOptions(OptionTypeEnum.PLANOGRAM_GROUPS, items)
  } catch (error) {
    log.error("Planogram not sync", error)
    setError("Planogram not sync")
  }
  return true
}
