import { RoutePath } from "@/constants/routes"
import { TransactionType } from "@/modules/customer/handlers/transaction.dto"
import { PermissionAccess } from "@/types/Permission.enum"

export type CustomerOptionType = {
  optionId: string
  title: string
  header: string
  description: string
  route: RoutePath
  permissionId: PermissionAccess
  key: TransactionType | null
}
