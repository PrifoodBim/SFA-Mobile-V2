import { router, useLocalSearchParams } from "expo-router"
import { useEffect } from "react"
import { FlatList } from "react-native"
import styled from "styled-components/native"
import { UserCard } from "@/components"
import Button from "@/components/Button"
import Container from "@/components/Container"
import Icon from "@/components/Icon"
import { Route } from "@/constants/routes"
import { CONFIRMATION_TRANSACTION, SAVE_RECORD_TEXT } from "@/constants/strings"
import { color } from "@/constants/theme"
import { createId, insert, useQuery } from "@/db"
import { CustomerModel } from "@/db/models/Customer.model"
import { alert, confirm } from "@/lib/modal"
import SaveCancelButtons from "@/modules/customer/components/SaveCancelButtons"
import { TransactionType } from "@/modules/customer/handlers/transaction.dto"
import { saveTransaction } from "@/modules/customer/handlers/transaction.handler"
import { PlanogramRecordModel } from "@/modules/customer/models/PlanogramRecord.model"
import { useCustomerVisitContext } from "@/provider/CustomerVisitProvider/CustomerVisitProvider"
import { useUserContext } from "@/provider/UserProvider/UserProvider"
import { MaterialIcon } from "@/types/icon.enum"

const MISSING_IMAGES_MESSAGE =
  "Please make sure to take a 'BEFORE' and 'AFTER' image."

const Content = styled.View`
  flex: 1;
  margin-top: 12px;
  padding: 0 12px;
`

const Empty = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const Photo = styled.ImageBackground`
  position: relative;
  width: 100%;
  height: 350px;
`

const Badge = styled.View`
  position: absolute;
  top: 4px;
  left: 4px;
  padding: 4px;
  border-radius: 4px;
  background-color: ${props => props.theme.color.white};
`

const BadgeText = styled.Text`
  color: ${props => props.theme.color.black};
`

const Separator = styled.View`
  height: 8px;
`

const BottomRow = styled.View`
  flex-direction: row;
  justify-content: space-around;
  padding: 12px 0;
`

const BADGES = ["Before", "After"]

export default function PlanogramImages() {
  const { selectedCustomer, photos, setPhotos } = useCustomerVisitContext()
  const { userId } = useUserContext()
  const { groupId, planogramCode } = useLocalSearchParams<{
    groupId: string
    planogramCode: string
  }>()
  const customer = useQuery(CustomerModel, {
    where: { code: selectedCustomer ?? "" },
  })[0]

  useEffect(() => {
    setPhotos([])
  }, [])

  function goToCustomerDashboard() {
    router.dismissTo(Route.CUSTOMER_DASHBOARD)
  }

  async function handleConfirm() {
    try {
      if (photos.length < 2) {
        await alert({
          title: "Warning",
          message: MISSING_IMAGES_MESSAGE,
          singleButtonText: "Continue",
        })
        return
      }

      const transId = createId()
      insert(PlanogramRecordModel, {
        _id: transId,
        planoDate: new Date().toISOString(),
        customerCode: selectedCustomer ?? "",
        planogramCode: planogramCode ?? "",
        username: userId,
        transId: "0",
        groupCode: groupId ?? "",
        imageBefore: `file://${photos[0].fileName}`,
        imageAfter: `file://${photos[1].fileName}`,
      })
      await saveTransaction(TransactionType.PLANOGRAM, transId)
      goToCustomerDashboard()
    } catch (error) {
      console.error(error)
    }
  }

  async function handleSave() {
    if (photos.length < 1) {
      await alert({
        title: "Warning",
        message: MISSING_IMAGES_MESSAGE,
        singleButtonText: "Continue",
      })
      return
    }

    const isConfirmed = await confirm({
      title: SAVE_RECORD_TEXT,
      message: CONFIRMATION_TRANSACTION,
    })
    if (isConfirmed) {
      await handleConfirm()
    }
  }

  function handleClickBefore() {
    router.push({
      pathname: Route.CAMERA,
      params: { index: "0", insertInto: "PLANOGRAM" },
    })
  }

  async function handleClickAfter() {
    if (photos.length < 1) {
      await alert({
        title: "Warning",
        message: "Please make sure to take a 'BEFORE' image.",
      })
      return
    }

    router.push({
      pathname: Route.CAMERA,
      params: { index: "1", insertInto: "PLANOGRAM" },
    })
  }

  return (
    <Container>
      <UserCard
        name={customer?.name}
        description={customer?.code}
        isCurrentUserInfo={false}
      />
      <SaveCancelButtons onSave={handleSave} onCancel={goToCustomerDashboard} />
      <Content>
        {photos.length < 1 ? (
          <Empty>
            <Icon
              name={MaterialIcon.HIDE_IMAGE}
              size={50}
              color={color.grey500}
            />
            <BadgeText>Add Image</BadgeText>
          </Empty>
        ) : (
          <FlatList
            data={photos}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={Separator}
            renderItem={({ item, index }) => (
              <Photo
                source={{ uri: `file://${item.fileName}` }}
                resizeMode="cover"
              >
                {BADGES[index] && (
                  <Badge>
                    <BadgeText>{BADGES[index]}</BadgeText>
                  </Badge>
                )}
              </Photo>
            )}
            keyExtractor={item => item.fileName}
          />
        )}
      </Content>
      <BottomRow>
        <Button
          title="Before"
          buttonColor="tertiary"
          width={150}
          textStyle={{ color: color.white }}
          onPress={handleClickBefore}
        />
        <Button
          title="After"
          width={150}
          textStyle={{ color: color.black }}
          buttonStyle={{
            backgroundColor: color.gold,
            flexDirection: "row-reverse",
          }}
          onPress={handleClickAfter}
        />
      </BottomRow>
    </Container>
  )
}
