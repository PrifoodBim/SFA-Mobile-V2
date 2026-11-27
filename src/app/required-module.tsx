import styled from "styled-components/native"
import Button from "@/components/Button"
import { color } from "@/constants/theme"
import { RequiredModuleOptions, useModalRequest } from "@/lib/modal"

const Backdrop = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
`

// Same size and spacing as the confirmation dialog (components/ModalDisplay).
const Card = styled.View`
  width: 300px;
  padding: 32px 0;
  border-radius: 6px;
  align-items: center;
  background-color: ${props => props.theme.color.gold};
`

const Title = styled.Text`
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  color: ${props => props.theme.color.black};
`

const Message = styled.Text`
  margin-top: 12px;
  padding: 0 32px;
  font-size: 14px;
  text-align: center;
  color: ${props => props.theme.color.black};
`

const Bold = styled.Text`
  font-weight: bold;
`

const Actions = styled.View`
  margin-top: 24px;
`

/** Opened with `alertRequiredModule()` when a customer module is still locked. */
export default function RequiredModuleModal() {
  const { options, close } = useModalRequest<RequiredModuleOptions>()

  if (!options) {
    return null
  }

  return (
    <Backdrop>
      <Card>
        <Title>Required Module</Title>
        <Message>
          You must complete{"\n"}
          <Bold>{options.requirementNames} Records</Bold>
          {"\n"}transaction before accessing this module.
        </Message>
        <Actions>
          <Button
            width={100}
            title="OK"
            buttonStyle={{ backgroundColor: color.blue300 }}
            onPress={() => close()}
          />
        </Actions>
      </Card>
    </Backdrop>
  )
}
