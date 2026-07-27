import { useMemo } from "react"
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native"

type ButtonType = "primary" | "secondary" | "tertiary"

type Props = TouchableOpacityProps & {
  buttonName?: string
  isFullWidth?: boolean
  width?: number
  buttonColor?: ButtonType
}

export default function Button(props: Readonly<Props>) {
  const {
    buttonName,
    isFullWidth = true,
    width,
    buttonColor = "primary",
  } = props

  const buttonStyle = isFullWidth
    ? "w-full"
    : width
      ? `w-[${width}px]`
      : "w-auto"

  const buttonColorStyle = useMemo(() => {
    switch (buttonColor) {
      case "primary":
        return "bg-blue-500"
      case "secondary":
        return "bg-gray-500"
      case "tertiary":
        return "bg-green-500"
      default:
        return "bg-blue-500"
    }
  }, [buttonColor])

  return (
    <TouchableOpacity
      className={`px-4 py-2 rounded ${buttonStyle} ${buttonColorStyle}`}
      {...props}
    >
      <Text className={`text-white text-center `}>{buttonName}</Text>+
    </TouchableOpacity>
  )
}
