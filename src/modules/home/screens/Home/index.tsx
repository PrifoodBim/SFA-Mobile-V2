import { router, useNavigation } from "expo-router"
import { useEffect } from "react"
import { FlatList } from "react-native"
import { Container, OptionCard, UserCard } from "@/components"
import SizeBox from "@/components/SizeBox"
import { Route } from "@/constants/routes"
import { getTransaction } from "@/modules/customer/handlers/transaction.handler"
import { HOME_OPTIONS, HomeOption } from "@/modules/home/constants/homeOption"
import { useCustomerVisitContext } from "@/provider/CustomerVisitProvider/CustomerVisitProvider"
import { useUserContext } from "@/provider/UserProvider/UserProvider"
import { getDataFromStorage, KEY } from "@/utils/storage.utils"

export default function Home() {
  const { setUserId, setUserData, userData } = useUserContext()
  const { setSelectedCustomer } = useCustomerVisitContext()
  const navigation = useNavigation()

  const permissions = userData?.grantedPermissions
  const granted = HOME_OPTIONS.filter(
    option => permissions?.[option.key] === "true",
  )
  // Pad to an even count so the last card stays in the left column.
  const options: (HomeOption | null)[] =
    granted.length % 2 === 0 ? granted : [...granted, null]

  useEffect(() => {
    async function loadUser() {
      const user = await getDataFromStorage(KEY.USER)
      if (!user) return
      setUserData(user)
      setUserId(user.empId)
      await redirectToActiveCustomer(user.empId)
    }

    // The app was closed during a customer visit that was not exited: go back to it.
    async function redirectToActiveCustomer(empId: string) {
      const transactionData = await getTransaction()
      if (!transactionData || transactionData.userId !== empId) {
        return
      }
      // Only on a fresh launch, when Home is the only screen in its stack.
      if (navigation.getState()?.routes.length !== 1) {
        return
      }
      setSelectedCustomer(transactionData.customerCode)
      router.push(Route.CUSTOMER)
      router.push(Route.CUSTOMER_DASHBOARD)
    }
    loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Container background={false}>
      <UserCard />
      <SizeBox height={12} />
      <FlatList
        data={options}
        keyExtractor={(item, index) => item?.title ?? `empty-${index}`}
        renderItem={({ item }) =>
          item ? (
            <OptionCard
              optionNumber={item.optionNumber}
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
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </Container>
  )
}
