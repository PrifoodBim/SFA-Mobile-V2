import { router } from "expo-router"
import Checkbox from "expo-checkbox"
import { useEffect, useState } from "react"
import styled from "styled-components/native"
import { pickDate } from "@/components/CalendarModal"
import { CALENDAR_ICON, NO_IMAGE } from "@/constants/images"
import { ItemProduct } from "@/modules/customer/types/ProductItemProvider.type"
import { getImage } from "@/utils/image.utils"

type Props = {
  imageCode: string
  header: string
  description: string
  note?: React.ReactNode
  isShowCheckBox?: boolean
  isAllowOpenCalendar?: boolean
  placeHolder?: string
  item: ItemProduct
  calendarTitle?: string
  onChangeText?: (id: string, amount: string) => void
  onCheckItem?: (id: string, isCheck: boolean) => void
  onDateChange?: (id: string, date: Date | undefined) => void
}

const Wrapper = styled.View`
  width: 100%;
  padding: 0 12px;
`

const Card = styled.View`
  width: 100%;
  flex-direction: row;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  background-color: ${props => props.theme.color.white};
`

const Placeholder = styled.Image`
  width: 50px;
  height: 50px;
`

const ImageButton = styled.TouchableOpacity``

const Thumbnail = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border-width: 1px;
  border-color: ${props => props.theme.color.blue400};
  background-color: ${props => props.theme.color.white};
`

const Body = styled.View`
  flex: 1;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
`

const Header = styled.Text`
  font-weight: 600;
`

const Row = styled.View`
  width: 100%;
  flex-direction: row;
`

const Info = styled.View`
  flex: 1;
  justify-content: flex-start;
`

const Description = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.color.grey500};
`

const Note = styled.Text`
  color: ${props => props.theme.color.grey500};
`

const CheckBoxWrapper = styled.View`
  justify-content: center;
  padding: 10px;
`

const InputWrapper = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
`

const AmountInput = styled.TextInput<{ $hasValue: boolean }>`
  width: 80px;
  height: 35px;
  padding: 0 8px;
  border-width: 1px;
  border-radius: 6px;
  border-color: ${props => props.theme.color.grey300};
  font-size: 10px;
  text-align: ${props => (props.$hasValue ? "right" : "center")};
`

const CalendarButton = styled.TouchableOpacity`
  margin-left: 8px;
`

const CalendarCircle = styled.View`
  width: 30px;
  height: 30px;
  justify-content: center;
  align-items: center;
  border-radius: 15px;
  background-color: ${props => props.theme.color.blue400};
`

const CalendarImage = styled.Image`
  width: 13px;
  height: 13px;
`

function openImagePreview(uri: string) {
  router.push({ pathname: "/image-preview", params: { uri } })
}

export default function ProductItem(props: Readonly<Props>) {
  const {
    imageCode,
    isAllowOpenCalendar = false,
    header,
    description,
    note,
    isShowCheckBox = false,
    item,
    placeHolder,
    onChangeText,
    onCheckItem,
    calendarTitle,
    onDateChange,
  } = props
  const [amount, setAmount] = useState<string>(item.quantity ?? "")

  useEffect(() => {
    setAmount(item.quantity ?? "")
  }, [item.quantity])

  const image = imageCode ? getImage(imageCode + ".png") : undefined

  async function handleCalendar() {
    const date = await pickDate({ title: calendarTitle ?? "Select Date" })
    onDateChange?.(item._id, date)
  }

  function submitAmount() {
    onChangeText?.(item._id, amount)
  }

  return (
    <Wrapper>
      <Card>
        {image ? (
          <ImageButton onPress={() => openImagePreview(image)}>
            <Thumbnail source={{ uri: image }} resizeMode="center" />
          </ImageButton>
        ) : (
          <Placeholder source={NO_IMAGE} />
        )}
        <Body>
          <Header>{header}</Header>
          <Row>
            <Info>
              <Description>{description}</Description>
              {note && <Note>{note}</Note>}
            </Info>
            {isShowCheckBox && (
              <CheckBoxWrapper>
                <Checkbox
                  value={item.isCheck ?? false}
                  onValueChange={() => onCheckItem?.(item._id, !item.isCheck)}
                />
              </CheckBoxWrapper>
            )}

            <InputWrapper>
              <AmountInput
                $hasValue={!!amount}
                placeholder={placeHolder ?? ""}
                value={amount}
                keyboardType="number-pad"
                onChangeText={setAmount}
                onSubmitEditing={submitAmount}
                onBlur={submitAmount}
              />
              {isAllowOpenCalendar && (
                <CalendarButton onPress={handleCalendar}>
                  <CalendarCircle>
                    <CalendarImage source={CALENDAR_ICON} />
                  </CalendarCircle>
                </CalendarButton>
              )}
            </InputWrapper>
          </Row>
        </Body>
      </Card>
    </Wrapper>
  )
}
