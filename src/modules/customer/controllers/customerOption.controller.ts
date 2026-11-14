import { createId, findOne, insert, upsert, write } from "@/db"
import { OptionModel } from "@/db/models/Option.model"
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

    write(() => {
      items.forEach(element => {
        const existing = findOne(OptionModel, {
          where: { code: element.code, type: OptionTypeEnum.INVENTORY_STATUS },
        })

        if (!existing) {
          insert(OptionModel, {
            _id: createId(),
            code: element.code,
            value: element.name,
            type: OptionTypeEnum.INVENTORY_STATUS,
            subType: [],
          })
        }
      })
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

    write(() => {
      items.forEach(element => {
        const existing = findOne(OptionModel, {
          where: { code: element.code, type: OptionTypeEnum.PLANOGRAM_GROUPS },
        })

        upsert(OptionModel, {
          _id: existing?._id ?? createId(),
          code: element.code,
          value: element.name,
          type: OptionTypeEnum.PLANOGRAM_GROUPS,
          subType: [],
        })
      })
    })
  } catch (error) {
    log.error("Planogram not sync", error)
    setError("Planogram not sync")
  }
  return true
}
