import styled from "styled-components/native"
import { useModalRequest } from "@/lib/modal"
import SelectInventoryStatusOption from "@/modules/customer/components/SelectInventoryStatusOption"

const Backdrop = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
`

/**
 * Modal route `/inventory-status`: resolves with the selected inventory status code.
 *   const status = await openModalRoute<void, string>("/inventory-status", undefined)
 */
export default function InventoryStatusPicker() {
  const { close } = useModalRequest<void, string>()

  return (
    <Backdrop>
      <SelectInventoryStatusOption onSelect={close} />
    </Backdrop>
  )
}
