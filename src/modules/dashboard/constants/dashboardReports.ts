import { ImageSourcePropType } from "react-native"
import { KPI_ICONS } from "@/constants/images"
import { DashboardReport } from "@/modules/dashboard/models/DashboardReport.model"
import { PermissionAccess } from "@/types/Permission.enum"
import { displayMonthAndYear } from "@/utils/date.utils"

type ReportKey = Exclude<keyof DashboardReport, "id">

export type DashboardReportType = {
  icon: ImageSourcePropType
  description: string
  type: "TARGET" | "SALES" | "BALANCE" | "COMPLIANCE"
  color: string
  key: ReportKey
  /** Second value shown as "<key>-<additionalKey>" (compliance cards). */
  additionalKey?: ReportKey
  permissionId: PermissionAccess
}

export const DASHBOARD_REPORTS: DashboardReportType[] = [
  {
    icon: KPI_ICONS.target,
    description: "Annual",
    type: "TARGET",
    color: "#6F42C1",
    key: "ytdTarget",
    permissionId: PermissionAccess.Mobile_Dashboard_YTDTarget,
  },
  {
    icon: KPI_ICONS.target,
    description: displayMonthAndYear(new Date()),
    type: "TARGET",
    color: "#6F42C1",
    key: "mtdTarget",
    permissionId: PermissionAccess.Mobile_Dashboard_CurrentMonthTarget,
  },
  {
    icon: KPI_ICONS.file,
    description: "Year-to-Date",
    type: "SALES",
    color: "#0877BD",
    key: "ytdSales",
    permissionId: PermissionAccess.Mobile_Dashboard_YTDSales,
  },
  {
    icon: KPI_ICONS.file,
    description: displayMonthAndYear(new Date()),
    type: "SALES",
    color: "#0877BD",
    key: "mtdSales",
    permissionId: PermissionAccess.Mobile_Dashboard_CurrentMonthSales,
  },
  {
    icon: KPI_ICONS.shopping,
    description: "Year-to-Date",
    type: "BALANCE",
    color: "#198754",
    key: "ytdBalance",
    permissionId: PermissionAccess.Mobile_Dashboard_YTDBalance,
  },
  {
    icon: KPI_ICONS.shopping,
    description: displayMonthAndYear(new Date()),
    type: "BALANCE",
    color: "#198754",
    key: "mtdBalance",
    permissionId: PermissionAccess.Mobile_Dashboard_CurrentMonthBalance,
  },
  {
    icon: KPI_ICONS.mapPin,
    description: "Monthly Coverage",
    type: "COMPLIANCE",
    color: "#DC3545",
    key: "monthlyCoverageTarget",
    additionalKey: "monthlyCoverageCompleted",
    permissionId: PermissionAccess.Mobile_Dashboard_MonthlyCompliance,
  },
  {
    icon: KPI_ICONS.mapPin,
    description: "Daily Coverage",
    type: "COMPLIANCE",
    color: "#DC3545",
    key: "dailyCoverageTarget",
    additionalKey: "dailyCoverageCompleted",
    permissionId: PermissionAccess.Mobile_Dashboard_DailyCompliance,
  },
]
