import { router } from "expo-router"
import { FlatList } from "react-native"
import { Container, OptionCard, UserCard } from "@/components"
import SizeBox from "@/components/SizeBox"
import { Route, RoutePath } from "@/constants/routes"
import { useUserContext } from "@/provider/UserProvider/UserProvider"
import { PermissionAccess } from "@/types/Permission.enum"

type AdminOption = {
  optionId: string
  title: string
  header: string
  description: string
  route: RoutePath
  permissionId: PermissionAccess
}

const ADMIN_OPTIONS: AdminOption[] = [
  {
    optionId: "05.1",
    title: "Route",
    header: "Route Mapping",
    description: "Track your route",
    route: Route.ADMIN_ROUTE_TRACKING,
    permissionId: PermissionAccess.Mobile_Admin_RouteMapping,
  },
  {
    optionId: "05.2",
    title: "Demo",
    header: "Product Demo",
    description: "Marketing ads",
    route: Route.ADMIN_DEMO,
    permissionId: PermissionAccess.Mobile_Admin_ProductDemo,
  },
]

export default function Admin() {
  const { userData } = useUserContext()

  const permissions = userData?.grantedPermissions
  const granted = ADMIN_OPTIONS.filter(
    option => permissions?.[option.permissionId] === "true",
  )
  // Pad to an even count so the last card stays in the left column.
  const options: (AdminOption | null)[] =
    granted.length % 2 === 0 ? granted : [...granted, null]

  return (
    <Container padding={10}>
      <UserCard />
      <SizeBox height={10} />
      <FlatList
        data={options}
        style={{ flex: 1 }}
        keyExtractor={(item, index) => item?.optionId ?? `empty-${index}`}
        renderItem={({ item }) =>
          item ? (
            <OptionCard
              optionNumber={item.optionId}
              title={item.title}
              header={item.header}
              description={item.description}
              route={item.route}
              onPress={() => router.push(item.route)}
            />
          ) : (
            <SizeBox width={150} />
          )
        }
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-evenly" }}
        ItemSeparatorComponent={() => <SizeBox height={12} />}
      />
    </Container>
  )
}
