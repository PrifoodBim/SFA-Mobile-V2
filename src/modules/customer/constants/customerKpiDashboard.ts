import { ImageSourcePropType } from "react-native"
import { KPI_ICONS } from "@/constants/images"
import { CustomerKpi } from "@/modules/customer/models/CustomerKpi.model"
import { PermissionAccess } from "@/types/Permission.enum"
import { displayMonthAndYear } from "@/utils/date.utils"

export type KpiDashboardType = {
  icon: ImageSourcePropType
  description: string
  type: string
  color: string
  key: keyof CustomerKpi
  permissionId: PermissionAccess
}

const currentMonth = displayMonthAndYear(new Date())

export const customerDashboardKpi: KpiDashboardType[] = [
  {
    icon: KPI_ICONS.target,
    description: "Annual",
    type: "TARGET",
    color: "#6F42C1",
    key: "ytdTarget",
    permissionId: PermissionAccess.Mobile_Customer_KPI_YTDTarget,
  },
  {
    icon: KPI_ICONS.target,
    description: currentMonth,
    type: "TARGET",
    color: "#6F42C1",
    key: "mtdTarget",
    permissionId: PermissionAccess.Mobile_Customer_KPI_CurrentMonthTarget,
  },
  {
    icon: KPI_ICONS.file,
    description: "Year-to-Date",
    type: "SALES",
    color: "#0877BD",
    key: "ytdSales",
    permissionId: PermissionAccess.Mobile_Customer_KPI_YTDSales,
  },
  {
    icon: KPI_ICONS.file,
    description: currentMonth,
    type: "SALES",
    color: "#0877BD",
    key: "mtdSales",
    permissionId: PermissionAccess.Mobile_Customer_KPI_CurrentMonthSales,
  },
  {
    icon: KPI_ICONS.shopping,
    description: "Year-to-Date",
    type: "BALANCE",
    color: "#198754",
    key: "ytdBalance",
    permissionId: PermissionAccess.Mobile_Customer_KPI_YTDBalance,
  },
  {
    icon: KPI_ICONS.shopping,
    description: currentMonth,
    type: "BALANCE",
    color: "#198754",
    key: "mtdBalance",
    permissionId: PermissionAccess.Mobile_Customer_KPI_CurrentMonthBalance,
  },
  {
    icon: KPI_ICONS.clipboard,
    description: "Versus Actual",
    type: "LISTED SKU",
    color: "#DC3545",
    key: "listedSKU",
    permissionId: PermissionAccess.Mobile_Customer_KPI_ListedSkuVsActual,
  },
  {
    icon: KPI_ICONS.clipboard,
    description: currentMonth,
    type: "WDP SCHEME",
    color: "#DC3545",
    key: "monthlyPromo",
    permissionId: PermissionAccess.Mobile_Customer_KPI_CurrentMonthWDP,
  },
  {
    icon: KPI_ICONS.star,
    description: currentMonth,
    type: "NEW PRODUCT",
    color: "#D63384",
    key: "npl",
    permissionId: PermissionAccess.Mobile_Customer_KPI_CurrentMonthNewProduct,
  },
  {
    icon: KPI_ICONS.shopping,
    description: currentMonth,
    type: "OSA %",
    color: "#D63384",
    key: "osaPercentage",
    permissionId: PermissionAccess.Mobile_Customer_KPI_CurrentMonthOSA,
  },
  {
    icon: KPI_ICONS.trash,
    description: "Year-to-Date",
    type: "BO%",
    color: "#FD7E14",
    key: "ytdBadOrder",
    permissionId: PermissionAccess.Mobile_Customer_KPI_YTDBO,
  },
  {
    icon: KPI_ICONS.trash,
    description: currentMonth,
    type: "BO%",
    color: "#FD7E14",
    key: "mtdBadOrder",
    permissionId: PermissionAccess.Mobile_Customer_KPI_CurrentMonthBO,
  },
]
