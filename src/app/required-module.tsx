import styled from "styled-components/native"
import { RequiredModuleOptions, useModalRequest } from "@/lib/modal"

const Backdrop = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
`

const Card = styled.View`
  width: 210px;
  padding: 20px 20px 24px;
  border-radius: 6px;
  align-items: center;
  background-color: ${props => props.theme.color.gold};
`

const Title = styled.Text`
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  color: ${props => props.theme.color.black};
`

const Message = styled.Text`
  margin-top: 16px;
  font-size: 14px;
  text-align: center;
  color: ${props => props.theme.color.black};
`

const Bold = styled.Text`
  font-weight: bold;
`

const OkButton = styled.TouchableOpacity`
  margin-top: 20px;
  width: 80px;
  height: 40px;
  border-radius: 6px;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.theme.color.blue300};
`

const OkText = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.color.white};
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
        <OkButton accessibilityRole="button" onPress={() => close()}>
          <OkText>OK</OkText>
        </OkButton>
      </Card>
    </Backdrop>
  )
}
