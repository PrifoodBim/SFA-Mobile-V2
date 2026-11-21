import { Stack } from "expo-router"
import { stackScreenOptions } from "@/components/Headers/stack-options"

export default function HomeLayout() {
  return <Stack screenOptions={stackScreenOptions("/home")} />
}
