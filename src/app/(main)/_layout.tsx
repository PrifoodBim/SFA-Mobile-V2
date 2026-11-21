import { Tabs } from "expo-router"
import TabBar from "@/components/TabBar"

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={props => <TabBar {...props} />}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="alerts" />
    </Tabs>
  )
}
