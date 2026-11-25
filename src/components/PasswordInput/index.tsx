import { useState } from "react"
import { StyleProp, TextInputProps, TextStyle } from "react-native"
import styled from "styled-components/native"
import { color } from "@/constants/theme"
import { MaterialIcon } from "@/types/icon.enum"
import Icon from "../Icon"

type Props = TextInputProps & {
  label: string
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

const Row = styled.View`
  width: 100%;
  flex-direction: row;
  border-width: 1px;
  border-color: ${props => props.theme.color.grey300};
  border-radius: 6px;
  background-color: ${props => props.theme.color.white};
`

// Explicit text color (same as TextInput): without it Android falls back to
// the system text color, which can be white on white and hide the dots.
const Field = styled.TextInput`
  width: 80%;
  height: 40px;
  padding: 0 12px;
  color: ${props => props.theme.color.grey500};
`

const Toggle = styled.TouchableOpacity`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const ErrorText = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.color.red};
`

/** Text field with a show/hide password toggle. */
export default function PasswordInput(props: Readonly<Props>) {
  const { label, labelStyle, inputStyle, errorText, ...rest } = props
  const [isSecureText, setIsSecureText] = useState(true)

  return (
    <Wrapper>
      <Label style={labelStyle}>{label}</Label>
      <Row>
        <Field secureTextEntry={isSecureText} style={inputStyle} {...rest} />
        <Toggle onPress={() => setIsSecureText(!isSecureText)}>
          <Icon
            name={
              isSecureText
                ? MaterialIcon.EYE_OUTLINE
                : MaterialIcon.EYE_OFF_OUTLINE
            }
            size={20}
            isMaterialIcon={false}
            color={color.grey500}
          />
        </Toggle>
      </Row>
      {errorText ? <ErrorText>{errorText}</ErrorText> : null}
    </Wrapper>
  )
}
