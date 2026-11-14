import { FlatList } from "react-native"
import styled from "styled-components/native"
import { Container, UserCard } from "@/components"
import SizeBox from "@/components/SizeBox"
import { useQuery } from "@/db"
import {
  DASHBOARD_REPORTS,
  DashboardReportType,
} from "@/modules/dashboard/constants/dashboardReports"
import {
  DashboardReport,
  DashboardReportModel,
} from "@/modules/dashboard/models/DashboardReport.model"
import { useUserContext } from "@/provider/UserProvider/UserProvider"
import { formatNegativeNumberWithShortNumber } from "@/utils/math.utils"

const ReportCard = styled.View<{ $background: string }>`
  width: 150px;
  padding: 12px 20px;
  border-radius: 8px;
  background-color: ${props => props.$background};
`

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const Value = styled.Text`
  font-size: 25px;
  color: #fff600;
`

const ReportIcon = styled.Image`
  width: 20px;
  height: 20px;
`

const Description = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.color.white};
`

const Type = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.color.white};
`

function getValue(item: DashboardReportType, report?: DashboardReport) {
  if (!report) {
    return "0"
  }
  if (item.type === "COMPLIANCE") {
    const additional = item.additionalKey ? report[item.additionalKey] : 0
    return `${report[item.key] || "0"}-${additional || "0"}`
  }
  return formatNegativeNumberWithShortNumber(+report[item.key]) || "0"
}

export default function UserDashboard() {
  const report = useQuery(DashboardReportModel)[0]
  const { userData } = useUserContext()

  const permissions = userData?.grantedPermissions
  const granted = DASHBOARD_REPORTS.filter(
    item => permissions?.[item.permissionId] === "true",
  )
  // Pad to an even count so the last card stays in the left column.
  const reports: (DashboardReportType | null)[] =
    granted.length % 2 === 0 ? granted : [...granted, null]

  return (
    <Container>
      <UserCard />
      <FlatList
        style={{ marginVertical: 12 }}
        data={reports}
        keyExtractor={(_, index) => (index + 1).toString()}
        renderItem={({ item }) =>
          item ? (
            <ReportCard $background={item.color}>
              <Row>
                <Value>{getValue(item, report)}</Value>
                <ReportIcon source={item.icon} />
              </Row>
              <Description>{item.description}</Description>
              <Type>{item.type}</Type>
            </ReportCard>
          ) : (
            <SizeBox width={150} />
          )
        }
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-evenly" }}
        ItemSeparatorComponent={() => <SizeBox height={16} />}
      />
    </Container>
  )
}
