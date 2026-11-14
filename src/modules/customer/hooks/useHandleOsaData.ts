import { useEffect, useState } from "react"
import { createId, insert, update } from "@/db"
import { Product } from "@/db/models/Product.model"
import { ProductPartner } from "@/db/models/ProductPartner.model"
import { getPendingOsaTransaction } from "@/modules/customer/controllers/osa.controller"
import { TransactionType } from "@/modules/customer/handlers/transaction.dto"
import {
  getTransaction,
  isTransactionIncomplete,
  saveTransaction,
} from "@/modules/customer/handlers/transaction.handler"
import { Osa, OsaModel } from "@/modules/customer/models/Osa.model"
import { ItemProduct } from "@/modules/customer/types/ProductItemProvider.type"
import {
  buildItemProducts,
  setItemChecked,
  setItemQuantity,
} from "./buildItemProducts"

type Props = {
  productPartner: ProductPartner[]
  productInfos: Product[]
  username: string
  customerCode: string
}

/** The unsynced OSA saved earlier in this customer's unfinished visit. */
async function getCurrentOsa(customerCode: string): Promise<Osa | null> {
  const transactionData = await getTransaction()
  const transactionId =
    transactionData &&
    transactionData.customerCode === customerCode &&
    isTransactionIncomplete(transactionData)
      ? transactionData.osa.transactionId
      : null
  return getPendingOsaTransaction(transactionId)
}

export default function useHandleOsaData(props: Props) {
  const { productPartner, productInfos, username, customerCode } = props
  // Rows are built once on mount, like the original screen.
  const [itemProduct, setItemProduct] = useState<ItemProduct[]>(() =>
    buildItemProducts(productPartner, productInfos),
  )

  // Reopening OSA during the same visit shows the values saved before.
  useEffect(() => {
    let isActive = true
    getCurrentOsa(customerCode).then(currentOsa => {
      if (!isActive || !currentOsa) return
      setItemProduct(prev =>
        prev.map(item => {
          const savedLine = currentOsa.lines.find(
            line => line.productCode === item.productCode,
          )
          return {
            ...item,
            isCheck: savedLine?.osaTag ?? false,
            quantity: savedLine?.highSrp ? savedLine.highSrp.toString() : "",
          }
        }),
      )
    })
    return () => {
      isActive = false
    }
  }, [customerCode])

  const updateItem = (id: string, newQuantity: string) => {
    setItemProduct(prev => setItemQuantity(prev, id, newQuantity))
  }

  const checkItem = (id: string, isCheck: boolean) => {
    setItemProduct(prev => setItemChecked(prev, id, isCheck))
  }

  async function handleSaveOsa() {
    try {
      const lines = itemProduct.map((val, index) => ({
        lineNum: index + 1,
        productCode: val.productCode,
        osaTag: val.isCheck ?? false,
        highSrp: val.quantity ? +val.quantity : 0,
      }))
      const osaDate = new Date().toISOString()
      const currentOsa = await getCurrentOsa(customerCode)

      // Visit not yet completed: update the current OSA instead of a new one.
      if (currentOsa) {
        update(OsaModel, currentOsa._id, { lines, osaDate })
        await saveTransaction(TransactionType.OSA, currentOsa._id)
        return
      }

      const transId = createId()
      insert(OsaModel, {
        _id: transId,
        osaDate,
        username,
        customerCode,
        transId: "0",
        lines,
      })
      await saveTransaction(TransactionType.OSA, transId)
    } catch (error) {
      console.error(error)
    }
  }

  return {
    itemProduct,
    updateItem,
    checkItem,
    handleSaveOsa,
  }
}
