import { router } from "expo-router"
import Carousel from "pinar"
import { useState } from "react"
import { Dimensions, Image } from "react-native"
import { Dropdown } from "react-native-element-dropdown"
import styled from "styled-components/native"
import { UserCard } from "@/components"
import Button from "@/components/Button"
import Container from "@/components/Container"
import { Route } from "@/constants/routes"
import { color } from "@/constants/theme"
import { query, useQuery } from "@/db"
import { CustomerModel } from "@/db/models/Customer.model"
import { OptionModel } from "@/db/models/Option.model"
import { alert } from "@/lib/modal"
import { PlanogramModel } from "@/modules/customer/models/PlanogramRecord.model"
import { useCustomerVisitContext } from "@/provider/CustomerVisitProvider/CustomerVisitProvider"
import { MaterialIcon } from "@/types/icon.enum"
import { OptionTypeEnum } from "@/types/Option.type"
import { getImage } from "@/utils/image.utils"

type DropDownType = {
  label: string
  value: string
}

const WIDTH = Dimensions.get("window").width

const Title = styled.Text`
  margin-top: 20px;
  text-align: center;
  font-size: 18px;
`

const DropdownWrapper = styled.View`
  width: 85%;
  margin-top: 12px;
  align-self: center;
`

const Spacer = styled.View`
  height: 12px;
`

const EmptyGuide = styled.View`
  width: 100%;
  height: 300px;
  justify-content: center;
  align-items: center;
`

const EmptyText = styled.Text``

const Slide = styled.View`
  width: 100%;
  height: 100%;
  justify-content: flex-start;
  align-items: center;
`

export default function CustomerPlanogram() {
  const { selectedCustomer } = useCustomerVisitContext()
  const customer = useQuery(CustomerModel, {
    where: { code: selectedCustomer ?? "" },
  })[0]
  const [value, setValue] = useState<string>("")
  const [planogramCode, setPlanogramCode] = useState<string>("")
  const [listOfCode, setListOfCode] = useState<string[]>([])
  const [imageFileId, setImageFileId] = useState<string[]>([])

  const planogram = useQuery(OptionModel, {
    where: { type: OptionTypeEnum.PLANOGRAM_GROUPS },
  })

  const planoGramData: DropDownType[] = planogram.map(val => ({
    label: val.value,
    value: val.code,
  }))

  function selectGroup(groupCode: string) {
    setValue(groupCode)
    const data = query(PlanogramModel, { where: { groupCode, status: "A" } })

    if (data.length > 0) {
      const list = data.map(val => val.code)
      setPlanogramCode(list[0])
      setListOfCode(list)
      setImageFileId(data.map(val => val.imageFileObjectId))
    } else {
      setImageFileId([])
    }
  }

  async function handleCapture() {
    if (!value) {
      await alert({
        title: "Warning",
        message: "Please select a group to continue.",
        singleButtonText: "Retry",
      })
      return
    }

    router.push({
      pathname: Route.CUSTOMER_PLANOGRAM_IMAGE,
      params: { planogramCode, groupId: value },
    })
  }

  function handleIndexChange(params: { index: number }) {
    setPlanogramCode(listOfCode[params.index])
  }

  return (
    <Container>
      <UserCard
        name={customer?.name}
        description={customer?.code}
        isCurrentUserInfo={false}
      />
      <Title>Please Select</Title>

      <DropdownWrapper>
        <Dropdown
          style={{
            height: 40,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderRadius: 8,
            borderColor: color.grey300,
            backgroundColor: color.white,
          }}
          selectedTextStyle={{ color: color.grey500 }}
          data={planoGramData}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="SELECT GROUP"
          searchPlaceholder="Search..."
          value={value}
          onChange={item => selectGroup(item.value)}
        />
      </DropdownWrapper>
      <Spacer />
      {imageFileId.length < 1 ? (
        <EmptyGuide>
          <EmptyText>No Selected Planogram Guide</EmptyText>
        </EmptyGuide>
      ) : (
        <Carousel showsControls={false} onIndexChanged={handleIndexChange}>
          {imageFileId.map((item, index) => (
            <Slide key={index}>
              <Image
                source={{ uri: getImage(item + ".png") }}
                width={WIDTH}
                height={350}
                resizeMode="center"
              />
            </Slide>
          ))}
        </Carousel>
      )}
      <Button
        title="Capture"
        width={150}
        buttonStyle={{
          flexDirection: "row-reverse",
          alignSelf: "center",
          marginVertical: 12,
          backgroundColor: color.gold,
        }}
        icon={MaterialIcon.CAMERA_ALT}
        isShowIcon={true}
        textStyle={{ color: color.black }}
        onPress={handleCapture}
      />
    </Container>
  )
}
