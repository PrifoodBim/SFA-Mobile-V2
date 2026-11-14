import { router } from "expo-router"
import { useState } from "react"
import { FlatList } from "react-native"
import styled from "styled-components/native"
import { Container, SizeBox, UserCard } from "@/components"
import { CONFIRMATION_TRANSACTION, SAVE_RECORD_TEXT } from "@/constants/strings"
import { color } from "@/constants/theme"
import { createId, insert, useQuery } from "@/db"
import {
  ProductPartner,
  ProductPartnerModel,
} from "@/db/models/ProductPartner.model"
import useGetCustomer from "@/hooks/useGetCustomer"
import { confirm } from "@/lib/modal"
import ProductOrderItem from "@/modules/customer/components/ProductOrderItem"
import SaveCancelButtons from "@/modules/customer/components/SaveCancelButtons"
import { TransactionType } from "@/modules/customer/handlers/transaction.dto"
import { saveTransaction } from "@/modules/customer/handlers/transaction.handler"
import {
  CsLines,
  CsRecordModel,
} from "@/modules/customer/models/CsRecord.model"
import { DeliveryModel } from "@/modules/customer/models/Delivery.model"
import { InventoryModel } from "@/modules/customer/models/Inventory.model"
import { useCustomerVisitContext } from "@/provider/CustomerVisitProvider/CustomerVisitProvider"
import { useUserContext } from "@/provider/UserProvider/UserProvider"
import { getProductName } from "@/utils/string.utils"

const ListWrapper = styled.View`
  flex: 1;
  margin: 12px 0;
  padding: 0 12px;
`

export default function CustomerOrder() {
  const { selectedCustomer } = useCustomerVisitContext()
  const { userId } = useUserContext()
  const { customer } = useGetCustomer({
    selectedCustomer: selectedCustomer ?? "",
  })

  const [lines, setLines] = useState<Partial<CsLines>[]>([])

  const inventoryList = useQuery(InventoryModel, {
    where: { customerCode: selectedCustomer },
    sort: { field: "inventoryDate", descending: true },
  })

  const delivery = useQuery(DeliveryModel, {
    where: { customerCode: selectedCustomer },
    sort: { field: "deliveryDate", descending: true },
  })

  const products = useQuery(ProductPartnerModel, {
    where: { customerCode: selectedCustomer, status: "A" },
    sort: { field: "lineNum" },
  })

  // Beginning inventory = the latest inventory of the second most recent date.
  const uniqueDates = Array.from(
    new Set(inventoryList.map(inv => inv.inventoryDate.toISOString())),
  )
  const begInventory =
    uniqueDates.length < 2
      ? null
      : (inventoryList.find(
          inv => inv.inventoryDate.toISOString() === uniqueDates[1],
        ) ?? null)

  function handleSetData(payload: Partial<CsLines>) {
    setLines(prev => [...prev, payload])
  }

  async function handleSave() {
    try {
      const transId = createId()
      insert(CsRecordModel, {
        _id: transId,
        csDate: new Date().toISOString(),
        userName: userId,
        customerCode: selectedCustomer ?? "",
        transId: "0",
        // Each ProductOrderItem reports a complete line.
        lines: lines as CsLines[],
      })
      await saveTransaction(TransactionType.ORDER, transId)
      router.back()
    } catch (error) {
      console.error("Error saving CS Record:", error)
    }
  }

  async function handleOpenModal() {
    if (
      await confirm({
        title: SAVE_RECORD_TEXT,
        message: CONFIRMATION_TRANSACTION,
        successButtonColor: color.green500,
      })
    ) {
      await handleSave()
    }
  }

  function renderItem({
    item,
    index,
  }: {
    item: ProductPartner
    index: number
  }) {
    return (
      <ProductOrderItem
        index={index}
        delivery={delivery}
        ico={item.ico}
        mustCarry={item.mustCarry}
        productCode={item.productCode}
        inventory={inventoryList}
        beginningInventory={begInventory}
        imageCode={item.productCode}
        header={getProductName(item.productName)}
        description={item.packingType || ""}
        handleSetData={handleSetData}
      />
    )
  }

  return (
    <Container>
      <UserCard
        name={customer?.name}
        description={customer?.code}
        isCurrentUserInfo={false}
      />
      <SaveCancelButtons
        onSave={handleOpenModal}
        onCancel={() => router.back()}
      />
      <ListWrapper>
        <FlatList
          data={products}
          keyExtractor={item => item._id}
          ItemSeparatorComponent={() => <SizeBox height={12} />}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      </ListWrapper>
    </Container>
  )
}
