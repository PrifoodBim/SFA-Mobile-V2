import { useHeaderHeight } from "expo-router/react-navigation"
import { router } from "expo-router"
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
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
import useScrollToFocusedInput from "@/hooks/useScrollToFocusedInput"
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
  const headerHeight = useHeaderHeight()
  const keyboardScroll = useScrollToFocusedInput({ align: "nearest" })
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
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={headerHeight}
      style={{ flex: 1 }}
    >
      <Container>
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
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              />
            </ScrollView>
          </TouchableWithoutFeedback>
        </ListWrapper>
        <BottomSpace />
      </Container>
    </KeyboardAvoidingView>
  )
}
