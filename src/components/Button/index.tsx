import {
  StyleProp,
  TextStyle,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native"
import styled from "styled-components/native"
import { color } from "@/constants/theme"
import { MaterialIcon } from "@/types/icon.enum"
import Icon from "../Icon"

type ButtonColor = "primary" | "secondary" | "tertiary" | "danger" | "dark"

const BUTTON_COLORS: Record<ButtonColor, string> = {
  primary: color.green500,
  secondary: color.grey500,
  tertiary: color.blue400,
  danger: color.red,
  dark: color.black,
}

type Props = TouchableOpacityProps & {
  title?: string
  buttonColor?: ButtonColor
  /** Fixed width in px; full width when omitted. */
  width?: number
  icon?: MaterialIcon
  isShowIcon?: boolean
  buttonStyle?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

const Touchable = styled.TouchableOpacity<{
  $background: string
  $width?: number
}>`
  width: ${props => (props.$width ? `${props.$width}px` : "100%")};
  height: 48px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 12px;
  border-radius: 8px;
  background-color: ${props => props.$background};
  opacity: ${props => (props.disabled ? 0.6 : 1)};
`

const Label = styled.Text`
  color: ${props => props.theme.color.white};
`

export default function Button(props: Readonly<Props>) {
  const {
    title,
    buttonColor = "dark",
    width,
    icon,
    isShowIcon = false,
    buttonStyle,
    textStyle,
    ...rest
  } = props

  return (
    <Touchable
      $background={BUTTON_COLORS[buttonColor]}
      $width={width}
      style={buttonStyle}
      {...rest}
    >
      {isShowIcon && icon && (
        <Icon name={icon} size={14} iconStyle={textStyle} />
      )}
      <Label style={textStyle}>{title?.toUpperCase()}</Label>
    </Touchable>
  )
}
