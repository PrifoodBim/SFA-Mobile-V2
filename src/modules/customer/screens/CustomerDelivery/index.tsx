import { router } from "expo-router"
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native"
import styled from "styled-components/native"
import { UserCard } from "@/components"
import { pickDate } from "@/components/CalendarModal"
import Container from "@/components/Container"
import { CONFIRMATION_TRANSACTION, SAVE_RECORD_TEXT } from "@/constants/strings"
import { useQuery } from "@/db"
import { CustomerModel } from "@/db/models/Customer.model"
import { ProductModel } from "@/db/models/Product.model"
import { ProductPartnerModel } from "@/db/models/ProductPartner.model"
import { confirm } from "@/lib/modal"
import ProductItem from "@/modules/customer/components/ProductItem"
import SaveCancelButtons from "@/modules/customer/components/SaveCancelButtons"
import useHandleDeliveryData from "@/modules/customer/hooks/useHandleDeliveryData"
import useKeyboardVisible from "@/hooks/useKeyboardVisible"
import { ItemProduct } from "@/modules/customer/types/ProductItemProvider.type"
import { useCustomerVisitContext } from "@/provider/CustomerVisitProvider/CustomerVisitProvider"
import { useUserContext } from "@/provider/UserProvider/UserProvider"
import { getProductName } from "@/utils/string.utils"

const ListWrapper = styled.View`
  flex: 1;
  margin-top: 12px;
`

const Separator = styled.View`
  height: 12px;
`

const BottomSpace = styled.View`
  height: 12px;
`

export default function CustomerDelivery() {
  const { selectedCustomer } = useCustomerVisitContext()
  const { userId } = useUserContext()
  const isKeyboardVisible = useKeyboardVisible()
  const customerCode = selectedCustomer ?? ""

  const customer = useQuery(CustomerModel, { where: { code: customerCode } })[0]
  const products = useQuery(ProductPartnerModel, {
    where: { customerCode },
    sort: { field: "lineNum" },
  })
  const productInfos = useQuery(ProductModel)

  const { updateItem, itemProduct, handleSaveDelivery, isHasData } =
    useHandleDeliveryData({
      productPartner: products,
      productInfos,
      username: userId,
      customerCode,
    })

  function renderItem({ item }: { item: ItemProduct }) {
    return (
      <ProductItem
        imageCode={item.productCode}
        header={getProductName(item.productName)}
        description={item.packingType || ""}
        item={item}
        onChangeText={updateItem}
        placeHolder="Quantity"
      />
    )
  }

  async function handleSave() {
    if (!isHasData()) {
      return
    }
    Keyboard.dismiss()

    const date = await pickDate({ title: "Select Delivery Date" })
    if (!date) {
      return
    }

    const isConfirmed = await confirm({
      title: SAVE_RECORD_TEXT,
      message: CONFIRMATION_TRANSACTION,
    })
    if (isConfirmed) {
      handleSaveDelivery(date)
      router.back()
    }
  }

  return (
    <Container>
      <UserCard
        name={customer?.name}
        description={customer?.code}
        isCurrentUserInfo={false}
      />
      {!isKeyboardVisible && (
        <SaveCancelButtons onSave={handleSave} onCancel={() => router.back()} />
      )}
      <ListWrapper>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
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
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              />
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </ListWrapper>
      <BottomSpace />
    </Container>
  )
}
