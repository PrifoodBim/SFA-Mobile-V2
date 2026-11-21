import { Option, SubOption } from "@/db/models/Option.model"

export type SubOptionType = SubOption

export type OptionType = Option

export enum OptionTypeEnum {
  OSA = "OSA",
  RETURN = "RETURN",
  DEMO_GROUPS = "DEMO_GROUPS",
  MARKET_TYPES = "MARKET_TYPES",
  PAYMENT_TYPES = "PAYMENT_TYPES",
  SERVICE_NOTES_TYPES = "SERVICE_NOTES_TYPES",
  CATEGORIES_TYPES = "CATEGORIES_TYPES",
  EXPENSE_TYPES = "EXPENSE_TYPES",
  COST_CENTER = "COST_CENTER",
  INVENTORY_STATUS = "INVENTORY_STATUS",
  PLANOGRAM_GROUPS = "PLANOGRAM_GROUPS",
}
