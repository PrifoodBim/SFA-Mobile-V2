import { router, useFocusEffect } from "expo-router"
import { useCallback, useState } from "react"
import { FlatList } from "react-native"
import styled from "styled-components/native"
import { Button, Card, Container, TextInput, UserCard } from "@/components"
import SizeBox from "@/components/SizeBox"
import { Route } from "@/constants/routes"
import { createId, insert, query, write } from "@/db"
import { CoverageModel } from "@/db/models/Coverage.model"
import { CoverageLogsModel } from "@/db/models/CoverageLogs.model"
import { Customer, CustomerModel } from "@/db/models/Customer.model"
import useGetUserLocation from "@/hooks/useGetUserLocation"
import { confirm } from "@/lib/modal"
import { useCustomerVisitContext } from "@/provider/CustomerVisitProvider/CustomerVisitProvider"
import { blockIfOtherVisitIncomplete } from "@/modules/customer/handlers/customerVisit"
import { startTransaction } from "@/modules/customer/handlers/transaction.handler"
import { useUserContext } from "@/provider/UserProvider/UserProvider"

const HeaderBar = styled.View`
  width: 100%;
  height: 50px;
  flex-direction: row;
  align-items: center;
  background-color: ${props => props.theme.color.blue400};
`

const HeaderTitle = styled.Text`
  flex: 1;
  text-align: center;
  font-weight: 600;
  color: ${props => props.theme.color.white};
`

const SearchWrapper = styled.View`
  width: 100%;
  padding: 0 30px;
  justify-content: center;
  align-items: center;
`

const Actions = styled.View`
  flex-direction: row;
  width: 100%;
  margin-top: 12px;
  justify-content: space-evenly;
`

const CustomerName = styled.Text`
  color: ${props => props.theme.color.white};
`

const CustomerCode = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.color.white};
`

/** Active customers that are not in today's coverage plan of the user. */
function getCustomersNotInCoverage(userId: string) {
  const customers = query(CustomerModel, { where: { statusCode: "A" } })

  const date = new Date()
  const startOfDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  )
  const endOfDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1,
  )
  const todayMcp = query(CoverageModel, {
    where: { empId: userId, status: "A" },
    filter: coverage =>
      coverage.coverageDate >= startOfDay && coverage.coverageDate < endOfDay,
  })

  return customers.filter(
    customer =>
      !todayMcp.some(coverage => coverage.customerCode === customer.code),
  )
}

export default function Search() {
  const { userId, userData } = useUserContext()
  const { getLocation } = useGetUserLocation()
  const { setSelectedCustomer } = useCustomerVisitContext()
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [customers, setCustomers] = useState<Customer[]>([])

  useFocusEffect(
    useCallback(() => {
      setSearchTerm("")
      setCustomers(getCustomersNotInCoverage(userId))
    }, [userId]),
  )

  function handleChangeSearch(value: string) {
    setSearchTerm(value)
    if (!value) {
      setCustomers(getCustomersNotInCoverage(userId))
    }
  }

  function handleFind() {
    if (!searchTerm) {
      setCustomers(getCustomersNotInCoverage(userId))
      return
    }

    const searchUpper = searchTerm.toUpperCase()
    setCustomers(
      customers.filter(
        customer =>
          customer.name.toUpperCase().includes(searchUpper) ||
          customer.code.toString().includes(searchTerm),
      ),
    )
  }

  async function handleAddNewData(item: Customer) {
    try {
      const location = await getLocation()
      if (!location) {
        return
      }

      write(() => {
        insert(CoverageModel, {
          _id: createId(),
          coverageId: 0,
          userName: userId,
          empId: userId,
          empName: userData?.empName,
          position: userData?.position,
          coverageDate: new Date(),
          customerCode: item.code,
          customerName: item.name,
          priority: 0,
          planned: false,
          isVisited: 1,
          createDate: new Date(),
          createBy: "",
          status: item.statusCode ?? "",
          updatedDate: new Date(),
          updatedBy: "",
        })
        insert(CoverageLogsModel, {
          _id: createId(),
          customerCode: item.code,
          coverageId: 0,
          userName: userId,
          logDate: new Date(),
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString(),
          converageLogsId: 0,
        })
      })
    } catch (error) {
      console.error(error)
    }
  }

  async function handleSelectCustomer(item: Customer) {
    if (await blockIfOtherVisitIncomplete(item.code)) {
      return
    }
    const isConfirmed = await confirm({
      title: "Customer not in MCP",
      message:
        "This customer is not included in your scheduled visit for today. Any transaction with this customer will be tagged as unplanned. Continue?",
    })
    if (!isConfirmed) {
      return
    }
    await startTransaction({ customerCode: item.code, userId })
    setSelectedCustomer(item.code)
    handleAddNewData(item)
    router.push(Route.CUSTOMER_DASHBOARD)
  }

  return (
    <Container>
      <HeaderBar>
        <HeaderTitle>Search Customer</HeaderTitle>
      </HeaderBar>
      <UserCard />
      <SizeBox height={12} />
      <SearchWrapper>
        <TextInput
          label=""
          placeholder="Search customer"
          onChangeText={handleChangeSearch}
          value={searchTerm}
        />
      </SearchWrapper>
      <Actions>
        <Button
          title="Find"
          buttonColor="tertiary"
          width={150}
          onPress={handleFind}
        />
        <Button
          title="Cancel"
          buttonColor="danger"
          width={150}
          onPress={() => router.back()}
        />
      </Actions>

      <FlatList
        data={customers}
        keyExtractor={item => item.code}
        renderItem={({ item }) => (
          <Card
            isPressable
            cardStyle={{ paddingVertical: 16, paddingHorizontal: 12 }}
            onPress={() => handleSelectCustomer(item)}
          >
            <CustomerName>{item.name?.toUpperCase()}</CustomerName>
            <CustomerCode>{item.code.toUpperCase()}</CustomerCode>
          </Card>
        )}
        style={{
          width: "90%",
          alignSelf: "center",
          marginVertical: 12,
          backgroundColor: "transparent",
        }}
        ItemSeparatorComponent={() => <SizeBox height={12} />}
        showsVerticalScrollIndicator={false}
      />
    </Container>
  )
}
