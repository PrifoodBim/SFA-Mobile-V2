import styled from "styled-components/native"

type Props = {
  children: React.ReactNode
  label: string
}

const Wrapper = styled.View`
  flex: 1;
  flex-direction: column;
  gap: 8px;
`

const ValueBox = styled.View`
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border-width: 1px;
  border-color: #c8c8c8;
  background-color: ${props => props.theme.color.yellow300};
`

const Label = styled.Text`
  text-align: center;
  font-size: 12px;
`

export default function CardValue(props: Readonly<Props>) {
  return (
    <Wrapper>
      <ValueBox>{props.children}</ValueBox>
      <Label>{props.label}</Label>
    </Wrapper>
  )
}
