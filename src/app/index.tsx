import { useState } from "react"
import "../global.css"

import SizeBox from "@/components/custom/SizeBox"
import { Text, View } from "react-native"
import Button from "../components/custom/Buttton/index"
import Input from "../components/custom/Input/index"
export default function HomeScreen() {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  )

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black p-3">
      <Text>Sample</Text>
      <Input label="GG" errorMessage={errorMessage} />
      <SizeBox height={16} />
      <Button buttonName="Click Me" buttonColor="tertiary" />
    </View>
  )
}
