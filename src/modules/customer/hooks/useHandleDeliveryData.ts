import { useState } from "react"
import { createId, insert } from "@/db"
import { Product } from "@/db/models/Product.model"
import { ProductPartner } from "@/db/models/ProductPartner.model"
import { alert } from "@/lib/modal"
import { DeliveryModel } from "@/modules/customer/models/Delivery.model"
import { ItemProduct } from "@/modules/customer/types/ProductItemProvider.type"
import { isValidWholePositive } from "@/utils/math.utils"
import { buildItemProducts, setItemQuantity } from "./buildItemProducts"

type Props = {
  productPartner: ProductPartner[]
  productInfos: Product[]
  username: string
  customerCode: string
}

function withQuantity(items: ItemProduct[]) {
  return items.filter(val => val.quantity !== "" || Number(val.quantity) !== 0)
}

export default function useHandleDeliveryData(props: Props) {
  const { productPartner, productInfos, username, customerCode } = props
  // Rows are built once on mount, like the original screen.
  const [itemProduct, setItemProduct] = useState<ItemProduct[]>(() =>
    buildItemProducts(productPartner, productInfos),
  )

  const updateItem = (id: string, newQuantity: string) => {
    setItemProduct(prev => setItemQuantity(prev, id, newQuantity))
  }

  /** Validates the entered quantities; shows an alert and returns `false` when invalid. */
  function isHasData() {
    const filterData = withQuantity(itemProduct)

    if (filterData.length < 1) {
      alert({
        title: "No Data Entered",
        message: "Please enter the required information before saving.",
        singleButtonText: "Retry",
      })
      return false
    }

    if (filterData.some(val => !isValidWholePositive(val.quantity))) {
      alert({
        title: "Saving Failed",
        message:
          "Invalid character detected. Please remove any periods or commas from the input box.",
      })
      return false
    }

    return true
  }

  function handleSaveDelivery(date: Date) {
    try {
      insert(DeliveryModel, {
        _id: createId(),
        deliveryDate: date,
        username: username,
        customerCode: customerCode,
        transId: "0",
        lines: withQuantity(itemProduct).map((val, index) => ({
          lineNum: index + 1,
          productCode: val.productCode,
          quantity: val.quantity ? +val.quantity : 0,
        })),
      })
    } catch (error) {
      console.error(error)
    }
  }

  return {
    itemProduct,
    isHasData,
    updateItem,
    handleSaveDelivery,
  }
}
