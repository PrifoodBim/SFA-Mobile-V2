import styled from "styled-components/native"
import { Container, SizeBox, TextInput, UserCard } from "@/components"
import { color } from "@/constants/theme"
import useGetCustomer from "@/hooks/useGetCustomer"
import { useCustomerVisitContext } from "@/provider/CustomerVisitProvider/CustomerVisitProvider"

const Scroll = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,
})``

const Fields = styled.View`
  gap: 4px;
`

const fieldStyle = { backgroundColor: color.yellow300 }

export default function CustomerProfile() {
  const { selectedCustomer } = useCustomerVisitContext()
  const { customer } = useGetCustomer({
    selectedCustomer: selectedCustomer ?? "",
  })

  const fields = [
    { label: "City:", value: customer?.city },
    { label: "Manager:", value: customer?.contactName1 || "N/A" },
    { label: "Contact No.:", value: customer?.mobile1 || "N/A" },
    { label: "Email:", value: customer?.email1 || "N/A" },
    { label: "Frequency Code:", value: customer?.frequency || "N/A" },
    { label: "Payment Terms:", value: customer?.paymentTerms || "N/A" },
    { label: "Class:", value: customer?.className || "N/A" },
    { label: "Channel:", value: customer?.channelName || "N/A" },
  ]

  return (
    <Container>
      <UserCard
        name={customer?.name}
        description={customer?.code}
        isCurrentUserInfo={false}
      />
      <SizeBox height={12} />
      <Scroll>
        <Fields>
          <TextInput
            multiline
            numberOfLines={3}
            value={customer?.address}
            editable={false}
            label="Address:"
            inputStyle={[fieldStyle, { height: 80 }]}
          />
          {fields.map(field => (
            <TextInput
              key={field.label}
              value={field.value}
              label={field.label}
              editable={false}
              inputStyle={fieldStyle}
            />
          ))}
        </Fields>
      </Scroll>
      <SizeBox height={12} />
    </Container>
  )
}
