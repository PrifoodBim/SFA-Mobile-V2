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
    ...rest
  } = props

  const buttonStyle = isFullWidth
    ? "w-full"
    : width
      ? `w-[${width}px]`
      : "w-auto"

  const buttonColorStyle = useMemo(() => {
    switch (buttonColor) {
      case "primary":
        return "bg-prifoodgreen"
      case "secondary":
        return "bg-prifoodgray500"
      case "tertiary":
        return "bg-prifoodblue400"
      default:
        return "bg-prifoodgreen"
    }
  }, [buttonColor])

  return (
    <TouchableOpacity
      className={` h-[48px] justify-center items-center rounded-lg ${buttonStyle} ${buttonColorStyle}`}
      {...rest}
    >
      <Text className={`text-white text-center `}>{buttonName}</Text>
    </TouchableOpacity>
  )
}
