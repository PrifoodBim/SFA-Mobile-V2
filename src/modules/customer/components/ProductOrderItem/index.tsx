import { router } from "expo-router"
import { useEffect, useState } from "react"
import styled from "styled-components/native"
import { NO_IMAGE } from "@/constants/images"
import { CsLines } from "@/modules/customer/models/CsRecord.model"
import { Delivery } from "@/modules/customer/models/Delivery.model"
import { Inventory } from "@/modules/customer/models/Inventory.model"
import { getImage } from "@/utils/image.utils"

type Props = {
  productCode: string
  imageCode: string
  header: string
  description: string
  inventory: Inventory[]
  beginningInventory: Inventory | null
  delivery: Delivery[]
  ico: number
  mustCarry: boolean
  handleSetData: (data: Partial<CsLines>) => void
  index: number
}

const Card = styled.View`
  width: 100%;
  flex-direction: row;
  gap: 8px;
  padding: 12px;
  border-radius: 6px;
  background-color: ${props => props.theme.color.white};
`

const Placeholder = styled.Image`
  width: 50px;
  height: 50px;
`

const Thumbnail = styled.Image<{ $mustCarry: boolean }>`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border-width: 1px;
  border-color: ${props =>
    props.$mustCarry ? props.theme.color.red : props.theme.color.blue400};
  background-color: ${props => props.theme.color.white};
`

const Body = styled.View`
  flex: 1;
  flex-direction: column;
  gap: 8px;
`

const Header = styled.Text`
  font-weight: 600;
`

const Description = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.color.grey500};
`

const Titles = styled.View``

const Column = styled.View``

const Values = styled.View`
  flex-direction: row;
  gap: 50px;
`

const Value = styled.Text`
  font-size: 10px;
`

const Suggested = styled.Text`
  font-size: 10px;
  color: ${props => props.theme.color.red};
`

const ImageButton = styled.TouchableOpacity``

function getQuantity(
  lines: { productCode: string; quantity: number }[] | undefined,
  productCode: string,
) {
  return lines?.find(line => line?.productCode === productCode)?.quantity ?? 0
}

function openImagePreview(uri: string) {
  router.push({ pathname: "/image-preview", params: { uri } })
}

export default function ProductOrderItem(props: Readonly<Props>) {
  const {
    imageCode,
    inventory,
    beginningInventory,
    delivery,
    header,
    description,
    productCode,
    mustCarry,
    ico,
    index,
    handleSetData,
  } = props

  const ending = getQuantity(inventory[0]?.lines, productCode)
  const deliveryCount = getQuantity(delivery[0]?.lines, productCode)
  const begBalance = getQuantity(beginningInventory?.lines, productCode)
  const offTake = begBalance + deliveryCount - ending
  const suggested = +ico - +offTake

  useEffect(() => {
    handleSetData({
      lineNum: index + 1,
      productCode: productCode,
      begBal: begBalance,
      delivery: deliveryCount,
      endingInventory: ending,
      ico: ico,
      offtake: offTake,
      suggested: suggested,
    })
  }, [
    begBalance,
    deliveryCount,
    ending,
    offTake,
    suggested,
    ico,
    productCode,
    index,
  ])

  const image = imageCode ? getImage(imageCode + ".png") : undefined

  function openPicture() {
    if (!productCode) {
      return
    }
    const productImage = getImage(productCode + ".png")
    if (productImage) {
      openImagePreview(productImage)
    }
  }

  return (
    <Card>
      <ImageButton onPress={openPicture}>
        {image ? (
          <Thumbnail
            source={{ uri: image }}
            $mustCarry={mustCarry}
            resizeMode="center"
          />
        ) : (
          <Placeholder source={NO_IMAGE} />
        )}
      </ImageButton>
      <Body>
        <Titles>
          <Header>{header}</Header>
          <Description>{description}</Description>
        </Titles>
        <Values>
          <Column>
            <Value>BEGBAL : {begBalance}</Value>
            <Value>DELIVERY : {deliveryCount}</Value>
            <Value>ENDING: {ending}</Value>
          </Column>
          <Column>
            <Value>ICO : {ico}</Value>
            <Value>OFFTAKE: {offTake}</Value>
            <Value>
              SUGGESTED: <Suggested>{suggested}</Suggested>
            </Value>
          </Column>
        </Values>
      </Body>
    </Card>
  )
}
