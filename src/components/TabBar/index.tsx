import { router, Tabs, usePathname } from "expo-router"
import { ComponentProps } from "react"
import styled from "styled-components/native"
import { CUSTOMER_VISIT_ROUTES, Route, RoutePath } from "@/constants/routes"
import { color } from "@/constants/theme"
import { confirm } from "@/lib/modal"
import useKeyboardVisible from "@/hooks/useKeyboardVisible"
import { exitCustomerVisit } from "@/modules/customer/handlers/customerVisit"
import { useSessionContext } from "@/provider/SessionProvider/SessionProvider"
import { MaterialIcon } from "@/types/icon.enum"
import Icon from "../Icon"

type Tab = "home" | "search" | "alerts" | "logout"

const TABS: {
  key: Tab
  label: string
  icon: MaterialIcon
  isMaterialIcon: boolean
}[] = [
  { key: "home", label: "Home", icon: MaterialIcon.HOME, isMaterialIcon: true },
  {
    key: "search",
    label: "Search",
    icon: MaterialIcon.SEARCH,
    isMaterialIcon: true,
  },
  {
    key: "alerts",
    label: "Alert",
    icon: MaterialIcon.BELL,
    isMaterialIcon: false,
  },
  {
    key: "logout",
    label: "Sign Out",
    icon: MaterialIcon.LOGOUT,
    isMaterialIcon: true,
  },
]

const Bar = styled.View`
  height: 75px;
  flex-direction: row;
  justify-content: space-between;
  background-color: ${props => props.theme.color.blue400};
`

const TabButton = styled.TouchableOpacity<{ $focused: boolean }>`
  flex: 1;
  justify-content: center;
  align-items: center;
  opacity: ${props => (props.$focused ? 1 : 0.5)};
`

const Label = styled.Text`
  font-size: 10px;
  color: ${props => props.theme.color.white};
`

type TabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0]

function tabOf(pathname: string): Tab {
  if (pathname.startsWith(Route.SEARCH)) return "search"
  if (pathname.startsWith(Route.ALERT_DASHBOARD)) return "alerts"
  return "home"
}

/** Custom bottom bar; tab names match the folders in `src/app/(main)`. */
export default function TabBar({ navigation }: Readonly<TabBarProps>) {
  const pathname = usePathname() as RoutePath
  const { signOut } = useSessionContext()
  const isKeyboardVisible = useKeyboardVisible()
  const activeTab = tabOf(pathname)
  const isInCustomerVisit = CUSTOMER_VISIT_ROUTES.includes(pathname)

  async function handlePress(tab: Tab) {
    switch (tab) {
      case "logout": {
        const isSignOut = await confirm({
          title: "Signing Out",
          message:
            "Are you sure you want to exit the application? An internet connection will be required for your next login.",
          successButtonColor: color.red,
        })
        if (isSignOut) await signOut()
        return
      }
      case "home": {
        if (isInCustomerVisit && !(await exitCustomerVisit())) {
          return
        }
        if (activeTab !== "home") {
          navigation.navigate("home")
        } else if (pathname !== Route.HOME) {
          router.dismissAll()
        }
        return
      }
      case "search":
        // Search is only reachable from the coverage list.
        if (pathname === Route.CUSTOMER) navigation.navigate("search")
        return
      case "alerts":
        if (!isInCustomerVisit && pathname !== Route.CUSTOMER) {
          navigation.navigate("alerts")
        }
        return
    }
  }

  if (isKeyboardVisible) {
    return null
  }

  return (
    <Bar>
      {TABS.map(tab => (
        <TabButton
          key={tab.key}
          accessibilityRole="button"
          accessibilityState={{ selected: activeTab === tab.key }}
          $focused={activeTab === tab.key}
          onPress={() => handlePress(tab.key)}
        >
          <Icon name={tab.icon} isMaterialIcon={tab.isMaterialIcon} size={24} />
          <Label>{tab.label}</Label>
        </TabButton>
      ))}
    </Bar>
  )
}
