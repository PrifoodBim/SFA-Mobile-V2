import { Product } from "@/db/models/Product.model"
import { ProductPartner } from "@/db/models/ProductPartner.model"
import { ItemProduct } from "@/modules/customer/types/ProductItemProvider.type"

/** Active customer products (partner and product both status "A") as editable rows. */
export function buildItemProducts(
  productPartner: ProductPartner[],
  productInfos: Product[],
): ItemProduct[] {
  const productItems: ItemProduct[] = []

  productPartner.forEach(partner => {
    const productInfo = productInfos.find(
      prod => prod.code === partner.productCode,
    )

    if (productInfo?.statusCode === "A" && partner.status === "A") {
      productItems.push({
        ...partner,
        productName: productInfo.name,
        isCheck: false,
        quantity: "",
        itemStatus: "",
      })
    }
  })

  return productItems
}

export function setItemQuantity(
  items: ItemProduct[],
  id: string,
  quantity: string,
): ItemProduct[] {
  return items.map(item => (item._id === id ? { ...item, quantity } : item))
}

export function setItemChecked(
  items: ItemProduct[],
  id: string,
  isCheck: boolean,
): ItemProduct[] {
  return items.map(item => (item._id === id ? { ...item, isCheck } : item))
}
