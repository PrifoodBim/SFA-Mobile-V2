import styled from "styled-components/native"
import { color } from "@/constants/theme"
import Button from "../Button"

type Props = {
  title: string
  message: string
  onSuccess: () => void
  onCancel?: () => void
  isSingleButton?: boolean
  singleButtonText?: string
  successButtonText?: string
  cancelButtonText?: string
  successButtonColor?: string
}

const Card = styled.View`
  width: 300px;
  padding: 32px 0;
  border-radius: 6px;
  background-color: ${props => props.theme.color.gold};
`

const Title = styled.Text`
  font-size: 18px;
  font-weight: bold;
  text-align: center;
`

const Message = styled.Text`
  margin-top: 12px;
  padding: 0 32px;
  text-align: center;
`

const Actions = styled.View<{ $single: boolean }>`
  margin-top: 24px;
  flex-direction: row;
  justify-content: ${props => (props.$single ? "center" : "space-evenly")};
`

/** Yellow confirmation card rendered by the `/dialog` modal route. */
export default function ModalDisplay(props: Readonly<Props>) {
  const {
    title,
    message,
    onSuccess,
    onCancel,
    isSingleButton = false,
    singleButtonText = "Continue",
    successButtonText = "Yes",
    cancelButtonText = "No",
    successButtonColor = color.green500,
  } = props

  return (
    <Card>
      <Title>{title}</Title>
      <Message>{message}</Message>
      <Actions $single={isSingleButton}>
        <Button
          width={100}
          title={isSingleButton ? singleButtonText : successButtonText}
          buttonStyle={{ backgroundColor: successButtonColor }}
          onPress={onSuccess}
        />
        {!isSingleButton && (
          <Button
            width={100}
            title={cancelButtonText}
            buttonStyle={{ backgroundColor: color.grey }}
            onPress={onCancel}
          />
        )}
      </Actions>
    </Card>
  )
}
