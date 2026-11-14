import { Route, RoutePath } from "@/constants/routes"
import { PermissionAccess } from "@/types/Permission.enum"

export type HomeOption = {
  optionNumber: string
  title: string
  header: string
  description: string
  route: RoutePath
  key: PermissionAccess
}

export const HOME_OPTIONS: HomeOption[] = [
  {
    optionNumber: "01",
    title: "Dashboard",
    header: "View Targets",
    description: "Performance info",
    route: Route.DASHBOARD,
    key: PermissionAccess.Mobile_Dashboard,
  },
  {
    optionNumber: "02",
    title: "Customer",
    header: "BCP",
    description: "Basic call procedure",
    route: Route.CUSTOMER,
    key: PermissionAccess.Mobile_Customer,
  },
  {
    optionNumber: "03",
    title: "Password",
    header: "Security Setup",
    description: "Change password",
    route: Route.PASSWORD,
    key: PermissionAccess.Mobile_ChangePassword,
  },
  {
    optionNumber: "04",
    title: "Data Sync",
    header: "Synchronize",
    description: "Push and pull data",
    route: Route.DATA_SYNC,
    key: PermissionAccess.Mobile_DataSync,
  },
  {
    optionNumber: "05",
    title: "Admin",
    header: "Activity Monitoring",
    description: "Admin task",
    route: Route.ADMIN,
    key: PermissionAccess.Mobile_Admin,
  },
]
