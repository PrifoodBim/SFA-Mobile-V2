import { useHeaderHeight } from "expo-router/react-navigation"
import { router } from "expo-router"
import { useState } from "react"
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import styled from "styled-components/native"
import { Container, UserCard } from "@/components"
import { pickDate } from "@/components/CalendarModal"
import { CONFIRMATION_TRANSACTION, SAVE_RECORD_TEXT } from "@/constants/strings"
import { createId, insert, useQuery } from "@/db"
import { CustomerModel } from "@/db/models/Customer.model"
import { OptionModel } from "@/db/models/Option.model"
import { ProductModel } from "@/db/models/Product.model"
import { ProductPartnerModel } from "@/db/models/ProductPartner.model"
import { alert, confirm, openModalRoute } from "@/lib/modal"
import ProductItem from "@/modules/customer/components/ProductItem"
import SaveCancelButtons from "@/modules/customer/components/SaveCancelButtons"
import { TransactionType } from "@/modules/customer/handlers/transaction.dto"
import { saveTransaction } from "@/modules/customer/handlers/transaction.handler"
import {
  buildItemProducts,
  setItemQuantity,
} from "@/modules/customer/hooks/buildItemProducts"
import useScrollToFocusedInput from "@/hooks/useScrollToFocusedInput"
import { InventoryModel } from "@/modules/customer/models/Inventory.model"
import { ItemProduct } from "@/modules/customer/types/ProductItemProvider.type"
import { useCustomerVisitContext } from "@/provider/CustomerVisitProvider/CustomerVisitProvider"
import { useUserContext } from "@/provider/UserProvider/UserProvider"
import { OptionTypeEnum } from "@/types/Option.type"
import { dateFormat, formatDate } from "@/utils/date.utils"
import { isValidWholePositive } from "@/utils/math.utils"
import { getProductName } from "@/utils/string.utils"

const ListWrapper = styled.View`
  flex: 1;
  margin: 12px 0;
`

const Separator = styled.View`
  height: 12px;
`

const NoteText = styled.Text`
  font-size: 10px;
`

const NoteValue = styled.Text`
  font-size: 10px;
  color: ${props => props.theme.color.red};
`

export default function CustomerInventory() {
  const { userId } = useUserContext()
  const { selectedCustomer } = useCustomerVisitContext()
  const headerHeight = useHeaderHeight()
  const keyboardScroll = useScrollToFocusedInput({ align: "nearest" })
  const customerCode = selectedCustomer ?? ""

  const customer = useQuery(CustomerModel, { where: { code: customerCode } })[0]
  const options = useQuery(OptionModel, {
    where: { type: OptionTypeEnum.INVENTORY_STATUS },
  })
  const products = useQuery(ProductPartnerModel, {
    where: { customerCode },
    sort: { field: "lineNum" },
  })
  const productData = useQuery(ProductModel)

  // Rows are built once on mount, like the original screen.
  const [itemProduct, setItemProduct] = useState<ItemProduct[]>(() =>
    buildItemProducts(products, productData),
  )

  function updateItem(id: string, newQuantity: string) {
    setItemProduct(prev => setItemQuantity(prev, id, newQuantity))
  }

  function patchItem(id: string, changes: Partial<ItemProduct>) {
    setItemProduct(prev =>
      prev.map(item => (item._id === id ? { ...item, ...changes } : item)),
    )
  }

  async function onDateChange(id: string, date: Date | undefined) {
    if (!date) {
      patchItem(id, { expiry: undefined, itemStatus: undefined })
      return
    }

    patchItem(id, { expiry: date.toISOString() })
    const status = await openModalRoute<void, string>(
      "/inventory-status",
      undefined,
    )
    if (status !== undefined) {
      patchItem(id, { itemStatus: status })
    }
  }

  function displayStatus(code: string | undefined) {
    return options.find(val => val.code === code)?.value
  }

  async function handleSave() {
    Keyboard.dismiss()
    const itemCount = itemProduct.filter(val => val.quantity !== "")

    if (itemCount.length < 1) {
      await alert({
        title: "No Data Entered",
        message: "You must enter some information before saving.",
      })
      return
    }

    if (itemCount.some(val => !isValidWholePositive(val.quantity))) {
      await alert({
        title: "Saving Failed",
        message:
          "Invalid character detected. Please remove any periods or commas from the input box.",
        singleButtonText: "Retry",
      })
      return
    }

    if (itemCount.some(val => val.expiry === undefined)) {
      await alert({
        title: "Saving Failed",
        message: "Please make sure to select an expiry date for each item.",
        singleButtonText: "Retry",
      })
      return
    }

    if (itemCount.some(val => !val.itemStatus)) {
      await alert({
        title: "Saving Failed",
        message: "Please make sure to select a status for each item.",
        singleButtonText: "Retry",
      })
      return
    }

    const date = await pickDate({ title: "Select Inventory Date" })
    if (!date) {
      return
    }

    const isConfirmed = await confirm({
      title: SAVE_RECORD_TEXT,
      message: CONFIRMATION_TRANSACTION,
    })
    if (isConfirmed) {
      await handleConfirm(date)
    }
  }

  async function handleConfirm(date: Date) {
    try {
      const lines = itemProduct
        .filter(val => val.quantity !== "" || Number(val.quantity) !== 0)
        .map((val, index) => ({
          lineNum: index + 1,
          productCode: val.productCode,
          quantity: Number(val.quantity),
          expiryDate: val.expiry ? dateFormat(val.expiry, "YYYY-MM-DD") : "",
          statusOption: val.itemStatus ?? "",
        }))

      const transId = createId()
      insert(InventoryModel, {
        _id: transId,
        username: userId,
        customerCode,
        transId: "0",
        inventoryDate: new Date(date),
        lines,
      })
      await saveTransaction(TransactionType.INVENTORY, transId)
      router.back()
    } catch (error) {
      console.error(error)
    }
  }

  function renderItem({ item }: { item: ItemProduct }) {
    return (
      <ProductItem
        imageCode={item.productCode}
        header={getProductName(item.productName)}
        description={item.packingType || ""}
        item={item}
        placeHolder="Quantity"
        calendarTitle="Expiry Date"
        onChangeText={updateItem}
        onDateChange={onDateChange}
        isAllowOpenCalendar={true}
        note={
          <View>
            <NoteText>
              Expiry:
              <NoteValue>
                {item.expiry ? formatDate(item.expiry) : ""}
              </NoteValue>
            </NoteText>
            <NoteText>
              Status:
              <NoteValue>{displayStatus(item.itemStatus)}</NoteValue>
            </NoteText>
          </View>
        }
      />
    )
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={headerHeight}
      style={{ flex: 1 }}
    >
      <Container background={false}>
        <UserCard
          name={customer?.name}
          description={customer?.code}
          isCurrentUserInfo={false}
        />

        {/* Always shown: hiding it while typing made the list jump. */}
        <SaveCancelButtons onSave={handleSave} onCancel={() => router.back()} />

        <ListWrapper>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              {...keyboardScroll}
              contentContainerStyle={[
                { flexGrow: 1 },
                keyboardScroll.contentContainerStyle,
              ]}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            >
              <FlatList
                data={itemProduct}
                extraData={itemProduct}
                keyExtractor={item => item._id}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 100 }}
                ItemSeparatorComponent={Separator}
                renderItem={renderItem}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
              />
            </ScrollView>
          </TouchableWithoutFeedback>
        </ListWrapper>
      </Container>
    </KeyboardAvoidingView>
  )
}
