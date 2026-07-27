import { useMemo } from "react"
import { Text, TextInput, TextInputProps, View } from "react-native"

type Props = TextInputProps & {
  label?: string
  errorMessage?: string
}

export default function Input(props: Readonly<Props>) {
  const { label, errorMessage, editable = true } = props

  const displayLabel = useMemo(() => {
    if (!label) {
      return
    }

    return <Text className=" pl-3 text-sm text-gray-700">{label}</Text>
  }, [label])

  const displayErrorMessge = useMemo(() => {
    if (!errorMessage) {
      return
    }

    return <Text className="text-sm text-red-500">{errorMessage}</Text>
  }, [errorMessage])

  const displayTextInputStyle = useMemo(() => {
    if (!editable) {
      return "bg-gray-200 border-gray-400 text-gray-500"
    }

    if (errorMessage) {
      return "border-red-500 text-red-500"
    }

    return "border-gray-300 text-gray-700 "
  }, [errorMessage])

  return (
    <View className="w-full">
      {displayLabel}
      <TextInput
        className={`h-[40px] px-[12px] rounded-md w-full border ${displayTextInputStyle} dark:border-gray-600 dark:text-gray-200`}
        {...props}
      />
      {displayErrorMessge}
    </View>
  )
}
