import { dateFormat } from "@/utils/date.utils"
import {
  getDataFromStorage,
  KEY,
  removeStorage,
  saveStorage,
} from "@/utils/storage.utils"
import {
  CreateTransaction,
  TRANSACTION_REQUIREMENTS,
  TransactionData,
  TransactionItem,
  TransactionStatus,
  TransactionType,
  UpdateTransaction,
} from "./transaction.dto"

const getToday = () => dateFormat(new Date(), "YYYY-MM-DD")

const createTransactionItem = (
  customerCode: string,
  key: TransactionType,
): TransactionItem => ({
  transactionId: null,
  customerCode,
  hasTransaction: false,
  requirements: TRANSACTION_REQUIREMENTS[key],
})

export const createTransaction = async (data: CreateTransaction) => {
  const payload: TransactionData = {
    customerCode: data.customerCode,
    userId: data.userId,
    transactionDate: getToday(),
    osa: createTransactionItem(data.customerCode, TransactionType.OSA),
    planogram: createTransactionItem(
      data.customerCode,
      TransactionType.PLANOGRAM,
    ),
    order: createTransactionItem(data.customerCode, TransactionType.ORDER),
    inventory: createTransactionItem(
      data.customerCode,
      TransactionType.INVENTORY,
    ),
    dar: createTransactionItem(data.customerCode, TransactionType.DAR),
  }

  await saveStorage(KEY.TRANSACTION_DATA, payload)
  return payload
}

/** Visit is incomplete once OSA is saved but DAR is not. */
export const isTransactionIncomplete = (
  transactionData: TransactionData | null,
) =>
  !!transactionData &&
  transactionData.osa.hasTransaction &&
  !transactionData.dar.hasTransaction

/** Visit is finished once both OSA and DAR are saved. */
export const isTransactionFinished = (
  transactionData: TransactionData | null,
) =>
  !!transactionData &&
  transactionData.osa.hasTransaction &&
  transactionData.dar.hasTransaction

export const deleteTransaction = async () => {
  await removeStorage(KEY.TRANSACTION_DATA)
}

/**
 * The current customer visit. A visit from a previous day is dropped unless it
 * is incomplete, which must be finished before proceeding.
 */
export const getTransaction = async (): Promise<TransactionData | null> => {
  const transactionData = await getDataFromStorage<TransactionData>(
    KEY.TRANSACTION_DATA,
  )

  // Data saved by the previous format (no date / user) is discarded.
  if (!transactionData || !transactionData.transactionDate) {
    return null
  }

  if (
    transactionData.transactionDate !== getToday() &&
    !isTransactionIncomplete(transactionData)
  ) {
    await deleteTransaction()
    return null
  }

  return transactionData
}

/** Continues the unfinished visit of the same customer, otherwise starts a new one. */
export const startTransaction = async (data: CreateTransaction) => {
  const transactionData = await getTransaction()

  if (
    transactionData &&
    transactionData.customerCode === data.customerCode &&
    transactionData.userId === data.userId &&
    !isTransactionFinished(transactionData)
  ) {
    return transactionData
  }

  return await createTransaction(data)
}

export const isTransactionSaved = async (key: TransactionType) => {
  const transactionData = await getTransaction()
  return transactionData?.[key].hasTransaction ?? false
}

export const getMissingRequirements = async (key: TransactionType) => {
  const transactionData = await getTransaction()
  const requirements = TRANSACTION_REQUIREMENTS[key]

  if (!transactionData) {
    return requirements
  }

  return requirements.filter(
    requirement => !transactionData[requirement].hasTransaction,
  )
}

export const checkDataPermission = async (key: TransactionType) => {
  const missingRequirements = await getMissingRequirements(key)
  return missingRequirements.length < 1
}

export const getTransactionStatus = async (key: TransactionType) => {
  if (await isTransactionSaved(key)) {
    return TransactionStatus.SAVED
  }
  if (await checkDataPermission(key)) {
    return TransactionStatus.OPEN
  }
  return TransactionStatus.LOCKED
}

export const updateTransaction = async (
  key: TransactionType,
  data: UpdateTransaction,
) => {
  const transactionData = await getTransaction()
  if (!transactionData) {
    return false
  }
  transactionData[key] = { ...transactionData[key], ...data }
  await saveStorage(KEY.TRANSACTION_DATA, transactionData)
  return true
}

export const saveTransaction = async (
  key: TransactionType,
  transactionId: string,
) => updateTransaction(key, { transactionId, hasTransaction: true })
