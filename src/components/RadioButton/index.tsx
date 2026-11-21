import { Pressable, Text } from "react-native"
import styled from "styled-components/native"

type Props = {
  isSelected: boolean
  label: string
  value: string
  onSelect: (value: string) => void
}

const Row = styled.View`
  flex-direction: row;
  gap: 8px;
  justify-content: center;
  align-items: center;
`

const Circle = styled.View`
  width: 16px;
  height: 16px;
  justify-content: center;
  align-items: center;
  border-width: 1px;
  border-color: ${props => props.theme.color.black};
  border-radius: 8px;
  background-color: ${props => props.theme.color.white};
`

const Dot = styled.View`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${props => props.theme.color.black};
`

export default function RadioButton(props: Readonly<Props>) {
  const { isSelected, label, value, onSelect } = props

  return (
    <Pressable onPress={() => onSelect(value)}>
      <Row>
        <Circle>{isSelected && <Dot />}</Circle>
        <Text>{label}</Text>
      </Row>
    </Pressable>
  )
}
