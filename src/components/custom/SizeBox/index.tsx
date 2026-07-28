import { View } from "react-native"

type Prosp = {
  width?: number
  height?: number
}

export default function SizeBox(props: Readonly<Prosp>) {
  const { width, height } = props
  return <View style={{ width, height }} />
}
