import Checkbox from "expo-checkbox"
import styled from "styled-components/native"

type Props = {
  isCheck: boolean
  onPress: () => void
  label: string
}

const Wrapper = styled.View`
  gap: 4px;
  justify-content: center;
  align-items: center;
`

const Row = styled.Pressable`
  flex-direction: row;
  align-items: center;
`

const Label = styled.Text`
  font-size: 12px;
`

export default function CheckBoxWithValue(props: Readonly<Props>) {
  const { isCheck, label, onPress } = props
  return (
    <Wrapper>
      <Row onPress={onPress}>
        <Label>
          {label}
          {" : "}
        </Label>
        <Checkbox value={isCheck} onValueChange={() => onPress()} />
      </Row>
    </Wrapper>
  )
}
