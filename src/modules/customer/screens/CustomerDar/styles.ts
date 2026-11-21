import styled from "styled-components/native"

export const Scroll = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,
})`
  margin: 12px 0;
`

export const Form = styled.View`
  flex: 1;
  gap: 12px;
`

export const Panel = styled.View`
  flex: 1;
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  background-color: ${props => props.theme.color.white};
`

export const PanelTitle = styled.Text`
  text-align: center;
  font-size: 16px;
  color: ${props => props.theme.color.blue400};
`

export const Row = styled.View<{ $marginTop?: number }>`
  flex: 1;
  flex-direction: row;
  gap: 12px;
  margin-top: ${props => props.$marginTop ?? 0}px;
`

export const Cell = styled.View`
  flex: 1;
`

export const InputCell = styled.View`
  flex: 1;
  gap: 8px;
`

export const Value = styled.Text<{ $size: number }>`
  text-align: center;
  font-size: ${props => props.$size}px;
`

export const Caption = styled.Text`
  text-align: center;
  font-size: 12px;
`

export const OptionRow = styled.View`
  margin-top: 12px;
  flex-direction: row;
  justify-content: space-around;
`

export const ErrorText = styled.Text<{ $center?: boolean }>`
  text-align: ${props => (props.$center ? "center" : "left")};
  color: ${props => props.theme.color.red};
`
