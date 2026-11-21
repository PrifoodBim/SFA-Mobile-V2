export enum TransactionType {
  OSA = "osa",
  INVENTORY = "inventory",
  DAR = "dar",
  PLANOGRAM = "planogram",
  ORDER = "order",
}

export enum TransactionStatus {
  LOCKED = "locked",
  OPEN = "open",
  SAVED = "saved",
}

export type TransactionItem = {
  transactionId: string | null
  customerCode: string | null
  hasTransaction: boolean
  requirements: TransactionType[]
}

/** The customer visit in progress, kept in storage under `KEY.TRANSACTION_DATA`. */
export type TransactionData = {
  customerCode: string
  userId: string
  /** `YYYY-MM-DD` of the day the visit started. */
  transactionDate: string
  osa: TransactionItem
  planogram: TransactionItem
  order: TransactionItem
  inventory: TransactionItem
  dar: TransactionItem
}

export type CreateTransaction = {
  customerCode: string
  userId: string
}

export type UpdateTransaction = Partial<
  Pick<TransactionItem, "transactionId" | "hasTransaction">
>

/** Modules that must have a saved transaction before the key can be accessed. */
export const TRANSACTION_REQUIREMENTS: Record<
  TransactionType,
  TransactionType[]
> = {
  [TransactionType.OSA]: [],
  [TransactionType.PLANOGRAM]: [],
  [TransactionType.INVENTORY]: [TransactionType.OSA, TransactionType.PLANOGRAM],
  [TransactionType.ORDER]: [TransactionType.INVENTORY],
  [TransactionType.DAR]: [TransactionType.ORDER],
}

export const TRANSACTION_NAME: Record<TransactionType, string> = {
  [TransactionType.OSA]: "OSA",
  [TransactionType.PLANOGRAM]: "Planogram",
  [TransactionType.INVENTORY]: "Inventory",
  [TransactionType.ORDER]: "Suggested Order",
  [TransactionType.DAR]: "DAR",
}
