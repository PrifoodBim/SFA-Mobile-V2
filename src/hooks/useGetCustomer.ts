import { useQuery } from "@/db"
import { CustomerModel } from "@/db/models/Customer.model"

type Props = {
  selectedCustomer: string
}

/** The customer with code `selectedCustomer`, or `null` when not synced. */
export default function useGetCustomer(props: Readonly<Props>) {
  const { selectedCustomer } = props
  const customer =
    useQuery(CustomerModel, { where: { code: selectedCustomer } })[0] ?? null

  return {
    customer,
  }
}
