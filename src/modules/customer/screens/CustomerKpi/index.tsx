import { FlatList } from "react-native"
import styled from "styled-components/native"
import { Container, SizeBox, UserCard } from "@/components"
import { useQuery } from "@/db"
import useGetCustomer from "@/hooks/useGetCustomer"
import {
  customerDashboardKpi,
  KpiDashboardType,
} from "@/modules/customer/constants/customerKpiDashboard"
import {
  CustomerKpi as CustomerKpiData,
  CustomerKpiModel,
} from "@/modules/customer/models/CustomerKpi.model"
import { useCustomerVisitContext } from "@/provider/CustomerVisitProvider/CustomerVisitProvider"
import { useUserContext } from "@/provider/UserProvider/UserProvider"
import { formatNegativeNumberWithShortNumber } from "@/utils/math.utils"

const ListWrapper = styled.View`
  flex: 1;
  margin: 12px 0;
`

const EmptyCard = styled.View`
  width: 150px;
`

const KpiCard = styled.View<{ $color: string }>`
  width: 150px;
  padding: 12px 20px;
  border-radius: 8px;
  background-color: ${props => props.$color};
`

const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const Value = styled.Text`
  font-size: 25px;
  color: #fff600;
`

const KpiIcon = styled.Image`
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

function getHeader(item: KpiDashboardType, report?: CustomerKpiData) {
  if (!report) {
    return "0"
  }
  const value = report[item.key]
  if (item.key === "listedSKU") {
    return String(value || "0")
  }
  if (item.key === "npl") {
    return `${value || "0"}`
  }
  return formatNegativeNumberWithShortNumber(+value) || "0"
}

export default function CustomerKpi() {
  const { selectedCustomer } = useCustomerVisitContext()
  const { userData } = useUserContext()
  const { customer } = useGetCustomer({
    selectedCustomer: selectedCustomer ?? "",
  })

  const dataReports = useQuery(CustomerKpiModel, {
    where: { customerCode: selectedCustomer },
  })[0]

  const permissions = userData?.grantedPermissions
  const filteredOptions = customerDashboardKpi.filter(
    val => permissions?.[val.permissionId] === "true",
  )
  // Pad to an even count so the last card keeps the 2-column layout.
  const options: (KpiDashboardType | null)[] =
    filteredOptions.length % 2 === 0
      ? filteredOptions
      : [...filteredOptions, null]

  function renderItem({ item }: { item: KpiDashboardType | null }) {
    if (!item) {
      return <EmptyCard />
    }

    return (
      <KpiCard $color={item.color}>
        <HeaderRow>
          <Value>{getHeader(item, dataReports)}</Value>
          <KpiIcon source={item.icon} />
        </HeaderRow>
        <Description>{item.description}</Description>
        <Type>{item.type}</Type>
      </KpiCard>
    )
  }

  return (
    <Container>
      <UserCard
        name={customer?.name}
        description={customer?.code}
        isCurrentUserInfo={false}
      />
      <ListWrapper>
        <FlatList
          data={options}
          keyExtractor={(_, i) => (i + 1).toString()}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-evenly" }}
          ItemSeparatorComponent={() => <SizeBox height={16} />}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </ListWrapper>
    </Container>
  )
}
