import { TextInputProps } from "react-native"
import styled, { css } from "styled-components/native"

type Props = TextInputProps & {
  label?: string
  errorMessage?: string
}

const Wrapper = styled.View`
  width: 100%;
`

const Label = styled.Text`
  padding-left: 12px;
  font-size: 14px;
  color: #374151;
`

const ErrorText = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.color.red};
`

const Field = styled.TextInput<{ $hasError: boolean }>`
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border-radius: 6px;
  border-width: 1px;
  border-color: #d1d5db;
  color: #374151;
  ${props =>
    props.$hasError &&
    css`
      border-color: ${props.theme.color.red};
      color: ${props.theme.color.red};
    `}
  ${props =>
    props.editable === false &&
    css`
      background-color: #e5e7eb;
      border-color: #9ca3af;
      color: #6b7280;
    `}
`

export default function Input(props: Readonly<Props>) {
  const { label, errorMessage, editable = true, ...rest } = props

  return (
    <Wrapper>
      {label ? <Label>{label}</Label> : null}
      <Field editable={editable} $hasError={!!errorMessage} {...rest} />
      {errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}
    </Wrapper>
  )
}
