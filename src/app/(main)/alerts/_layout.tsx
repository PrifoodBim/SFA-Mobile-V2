import { Stack } from "expo-router"
import { stackScreenOptions } from "@/components/Headers/stack-options"

export default function AlertsLayout() {
  return <Stack screenOptions={stackScreenOptions("/alerts")} />
}
