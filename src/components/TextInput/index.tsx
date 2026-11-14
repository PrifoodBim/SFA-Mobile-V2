import { StyleProp, TextInputProps, TextStyle } from "react-native"
import styled from "styled-components/native"

type Props = TextInputProps & {
  label?: string
  inputStyle?: StyleProp<TextStyle>
  labelStyle?: StyleProp<TextStyle>
  errorText?: string | null
}

const Wrapper = styled.View`
  width: 100%;
`

const Label = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.color.grey};
`

const Field = styled.TextInput`
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border-width: 1px;
  border-color: ${props => props.theme.color.grey300};
  border-radius: 6px;
  color: ${props => props.theme.color.grey500};
  background-color: ${props => props.theme.color.white};
`

const ErrorText = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.color.red};
`

/** Labeled text field with an optional error line below it. */
export default function TextInput(props: Readonly<Props>) {
  const { label, labelStyle, inputStyle, errorText, ...rest } = props

  return (
    <Wrapper>
      {label ? <Label style={labelStyle}>{label}</Label> : null}
      <Field style={inputStyle} {...rest} />
      {errorText ? <ErrorText>{errorText}</ErrorText> : null}
    </Wrapper>
  )
}
