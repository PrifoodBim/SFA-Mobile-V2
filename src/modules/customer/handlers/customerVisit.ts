import { color } from "@/constants/theme"
import { alert, confirm } from "@/lib/modal"
import {
  deleteTransaction,
  getTransaction,
  isTransactionIncomplete,
} from "@/modules/customer/handlers/transaction.handler"

/**
 * Leaving the customer visit: blocked while OSA is saved but DAR is not,
 * no prompt once the visit is finished, otherwise asks for confirmation.
 * Resolves `true` when the visit was closed and the caller may navigate away.
 */
export async function exitCustomerVisit(): Promise<boolean> {
  const transactionData = await getTransaction()

  if (isTransactionIncomplete(transactionData)) {
    await alert({
      title: "Incomplete Transaction",
      message:
        "You have a saved OSA transaction. Please complete and save the DAR before exiting this customer.",
    })
    return false
  }

  if (!transactionData?.osa.hasTransaction) {
    const isExit = await confirm({
      title: "Customer Exit",
      message: "Are you sure you want to exit this customer?",
      successButtonColor: color.red,
    })
    if (!isExit) {
      return false
    }
  }

  await deleteTransaction()
  return true
}

/**
 * Opening a customer is blocked while another customer's visit has OSA saved
 * but no DAR. Resolves `true` (after telling the user) when it is blocked.
 */
export async function blockIfOtherVisitIncomplete(
  customerCode: string,
): Promise<boolean> {
  const transactionData = await getTransaction()
  if (
    !transactionData ||
    transactionData.customerCode === customerCode ||
    !isTransactionIncomplete(transactionData)
  ) {
    return false
  }

  await alert({
    title: "Incomplete Transaction",
    message: `Please complete the transaction of customer ${transactionData.customerCode} before proceeding to another customer.`,
  })
  return true
}
