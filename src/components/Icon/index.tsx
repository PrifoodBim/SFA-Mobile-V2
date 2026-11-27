import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"
import { StyleProp, TextStyle } from "react-native"
import { color as themeColor } from "@/constants/theme"
import { FoundationIcon, MaterialIcon } from "@/types/icon.enum"

type Props = {
  name: MaterialIcon | FoundationIcon
  size: number
  color?: string
  iconStyle?: StyleProp<TextStyle>
  /** `false` uses the MaterialCommunityIcons set. */
  isMaterialIcon?: boolean
}

export default function Icon(props: Readonly<Props>) {
  const {
    name,
    size,
    color = themeColor.white,
    iconStyle,
    isMaterialIcon = true,
  } = props
  const IconSet = isMaterialIcon ? MaterialIcons : MaterialCommunityIcons

  return (
    <IconSet name={name as never} size={size} color={color} style={iconStyle} />
  )
}
