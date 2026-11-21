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
import Container from "@/components/Container"
import { color } from "@/constants/theme"
import { useQuery } from "@/db"
import { CustomerModel } from "@/db/models/Customer.model"
import { ProductModel } from "@/db/models/Product.model"
import { ProductPartnerModel } from "@/db/models/ProductPartner.model"
import { alert, confirm } from "@/lib/modal"
import ProductItem from "@/modules/customer/components/ProductItem"
import SaveCancelButtons from "@/modules/customer/components/SaveCancelButtons"
import useHandleOsaData from "@/modules/customer/hooks/useHandleOsaData"
import useKeyboardVisible from "@/hooks/useKeyboardVisible"
import { ItemProduct } from "@/modules/customer/types/ProductItemProvider.type"
import { useCustomerVisitContext } from "@/provider/CustomerVisitProvider/CustomerVisitProvider"
import { useUserContext } from "@/provider/UserProvider/UserProvider"
import { formatNumber, isValidMoney } from "@/utils/math.utils"
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

const NoteText = styled.Text`
  font-size: 10px;
`

const NoteValue = styled.Text`
  font-size: 10px;
  font-weight: bold;
`

export default function CustomerOsa() {
  const { selectedCustomer } = useCustomerVisitContext()
  const { userId } = useUserContext()
  const isKeyboardVisible = useKeyboardVisible()
  const customerCode = selectedCustomer ?? ""

  const customer = useQuery(CustomerModel, { where: { code: customerCode } })[0]
  const products = useQuery(ProductPartnerModel, {
    where: { customerCode },
    sort: { field: "lineNum" },
  })
  const productInfo = useQuery(ProductModel)

  const { itemProduct, checkItem, updateItem, handleSaveOsa } =
    useHandleOsaData({
      productPartner: products,
      productInfos: productInfo,
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
        placeHolder="High Price"
        isShowCheckBox={true}
        onChangeText={updateItem}
        onCheckItem={checkItem}
        note={
          <NoteText>
            SRP: <NoteValue>{formatNumber(item.sellingPrice)}</NoteValue>
          </NoteText>
        }
      />
    )
  }

  async function handleSave() {
    const selectedItems = itemProduct.filter(item => item.isCheck)
    if (selectedItems.length < 1) {
      await alert({
        title: "No Data Entered",
        message: "You must enter some information before saving.",
      })
      return
    }

    const isItemNotValid = selectedItems.every(item => {
      if (item.quantity === "") {
        return false
      }
      return !isValidMoney(item.quantity?.toString() ?? "")
    })

    if (isItemNotValid) {
      await alert({
        title: "Amount Invalid",
        message: "Please enter a valid amount with up to two decimal places.",
      })
      return
    }

    const isConfirmed = await confirm({
      title: "Save Record",
      message: "Are you sure you want to save this transaction?",
      successButtonColor: color.green500,
    })
    if (isConfirmed) {
      await handleSaveOsa()
      router.back()
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Container>
          <UserCard
            name={customer?.name}
            description={customer?.code}
            isCurrentUserInfo={false}
          />
          {!isKeyboardVisible && (
            <SaveCancelButtons
              onSave={() => {
                Keyboard.dismiss()
                handleSave()
              }}
              onCancel={() => router.back()}
            />
          )}

          <ListWrapper>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
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
          </ListWrapper>
          <BottomSpace />
        </Container>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}
