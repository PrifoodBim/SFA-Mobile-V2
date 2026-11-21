import { router } from "expo-router"
import { FlatList, View } from "react-native"
import styled from "styled-components/native"
import { Card, Container, Icon, SizeBox, UserCard } from "@/components"
import { Route } from "@/constants/routes"
import { color } from "@/constants/theme"
import { createId, insert, update, useQuery, write } from "@/db"
import { Coverage, CoverageModel } from "@/db/models/Coverage.model"
import { CoverageLogsModel } from "@/db/models/CoverageLogs.model"
import useGetUserLocation from "@/hooks/useGetUserLocation"
import { alert, hideLoading, showLoading } from "@/lib/modal"
import { blockIfOtherVisitIncomplete } from "@/modules/customer/handlers/customerVisit"
import { startTransaction } from "@/modules/customer/handlers/transaction.handler"
import { useCustomerVisitContext } from "@/provider/CustomerVisitProvider/CustomerVisitProvider"
import { useUserContext } from "@/provider/UserProvider/UserProvider"
import { MaterialIcon } from "@/types/icon.enum"

const LOCATION_NOT_AVAILABLE = {
  title: "Location not available",
  message:
    "Your location is not available. Please find a way to enable location services.",
  singleButtonText: "OK",
}

const Content = styled.View`
  flex: 1;
  gap: 12px;
`

const CoverageSection = styled.View`
  flex: 1;
  padding-bottom: 12px;
`

const Title = styled.Text`
  margin-top: 8px;
  text-align: center;
  font-size: 18px;
`

const ListWrapper = styled.View`
  flex: 1;
  margin: 12px 0;
`

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
`

const CustomerName = styled.Text<{ $visited: boolean }>`
  color: ${props =>
    props.$visited ? props.theme.color.yellow400 : props.theme.color.white};
`

const CustomerCode = styled(CustomerName)`
  font-size: 12px;
`

function getToday() {
  const date = new Date()
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
  return { start, end }
}

export default function CoverageList() {
  const { setSelectedCustomer, setLatLng } = useCustomerVisitContext()
  const { userId } = useUserContext()
  const { getLocation } = useGetUserLocation()

  const { start, end } = getToday()
  const coverages = useQuery(
    CoverageModel,
    {
      where: { empId: userId, status: "A" },
      filter: coverage =>
        coverage.coverageDate >= start && coverage.coverageDate < end,
      sort: { field: "priority" },
    },
    [start.getTime()],
  )

  async function handleSelect(data: Coverage) {
    if (await blockIfOtherVisitIncomplete(data.customerCode)) {
      return
    }
    try {
      showLoading()
      const location = await getLocation()
      if (!location) {
        await alert(LOCATION_NOT_AVAILABLE)
        return
      }

      write(() => {
        insert(CoverageLogsModel, {
          _id: createId(),
          customerCode: data.customerCode,
          converageLogsId: 0,
          coverageId: data.coverageId,
          userName: data.userName,
          logDate: new Date(),
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString(),
        })
        update(CoverageModel, data._id, { isVisited: 1 })
      })
      setLatLng({
        latitude: location.latitude,
        longitude: location.longitude,
      })
      await startTransaction({ customerCode: data.customerCode, userId })
      setSelectedCustomer(data.customerCode)
      hideLoading()
      router.push(Route.CUSTOMER_DASHBOARD)
    } catch (error) {
      console.error("Error selecting customer:", error)
      const errorCode = error instanceof Error ? error.message : error
      if (String(errorCode) === "3") {
        await alert(LOCATION_NOT_AVAILABLE)
        return
      }
      hideLoading()
    }
  }

  function renderItem({ item }: { item: Coverage }) {
    const isVisited = item.isVisited === 1

    return (
      <Card
        isPressable={true}
        cardStyle={{ paddingVertical: 16, paddingHorizontal: 12 }}
        onPress={() => handleSelect(item)}
      >
        <Row>
          <View>
            <CustomerName $visited={isVisited}>
              {item.customerName.toUpperCase()}
            </CustomerName>
            <CustomerCode $visited={isVisited}>
              {item.customerCode.toUpperCase()}
            </CustomerCode>
          </View>
          {isVisited && (
            <Icon name={MaterialIcon.CHECK} size={15} color={color.yellow400} />
          )}
        </Row>
      </Card>
    )
  }

  return (
    <Container>
      <Content>
        <UserCard />
        <CoverageSection>
          <Title>Coverage for Today</Title>
          <SizeBox height={12} />
          <ListWrapper>
            <FlatList
              data={coverages}
              keyExtractor={val => val._id}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <SizeBox height={12} />}
              showsVerticalScrollIndicator={false}
            />
          </ListWrapper>
        </CoverageSection>
      </Content>
    </Container>
  )
}
