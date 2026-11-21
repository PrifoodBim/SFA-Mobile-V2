import { router } from "expo-router"
import { FlatList } from "react-native"
import styled from "styled-components/native"
import { Container, OptionCard, SizeBox, UserCard } from "@/components"
import useGetCustomer from "@/hooks/useGetCustomer"
import { alertRequiredModule } from "@/lib/modal"
import { customerDashboardOption } from "@/modules/customer/constants/customerDashboardOption"
import { TRANSACTION_NAME } from "@/modules/customer/handlers/transaction.dto"
import { getMissingRequirements } from "@/modules/customer/handlers/transaction.handler"
import { CustomerOptionType } from "@/modules/customer/types/customerOption.type"
import { useCustomerVisitContext } from "@/provider/CustomerVisitProvider/CustomerVisitProvider"
import { useUserContext } from "@/provider/UserProvider/UserProvider"

const EmptyOption = styled.View`
  width: 150px;
`

export default function CustomerDashboard() {
  const { selectedCustomer } = useCustomerVisitContext()
  const { userData } = useUserContext()

  const { customer } = useGetCustomer({
    selectedCustomer: selectedCustomer ?? "",
  })

  const permissions = userData?.grantedPermissions
  const filteredOptions = customerDashboardOption.filter(
    val => permissions?.[val.permissionId] === "true",
  )
  // Pad to an even count so the last card keeps the 2-column layout.
  const options: (CustomerOptionType | null)[] =
    filteredOptions.length % 2 === 0
      ? filteredOptions
      : [...filteredOptions, null]

  function renderItem({ item }: { item: CustomerOptionType | null }) {
    if (!item) {
      return <EmptyOption />
    }

    return (
      <OptionCard
        optionNumber={item.optionId}
        title={item.title}
        header={item.header}
        description={item.description}
        route={item.route}
        transactionKey={item.key}
        onPress={() => navigateRoutes(item)}
      />
    )
  }

  // A module opens only once the modules it requires have been saved.
  async function navigateRoutes(option: CustomerOptionType) {
    if (option.key) {
      const missingRequirements = await getMissingRequirements(option.key)
      if (missingRequirements.length > 0) {
        await alertRequiredModule({
          requirementNames: missingRequirements
            .map(val => TRANSACTION_NAME[val])
            .join(" and "),
        })
        return
      }
    }
    router.push(option.route)
  }

  return (
    <Container background={false}>
      <UserCard
        name={customer?.name}
        description={customer?.code}
        isCurrentUserInfo={false}
      />
      <SizeBox height={12} />
      <FlatList
        data={options}
        keyExtractor={(item, index) => item?.optionId ?? `empty-${index}`}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-evenly" }}
        ItemSeparatorComponent={() => <SizeBox height={12} />}
      />
      <SizeBox height={12} />
    </Container>
  )
}
