import styled from "styled-components/native"
import { useModalRequest } from "@/lib/modal"
import ActivityTypeOption from "@/modules/customer/components/ActivityTypeOption"

const Backdrop = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
`

/**
 * Modal route `/market-activity`: resolves with the selected market activity type code.
 *   const type = await openModalRoute<void, string>("/market-activity", undefined)
 */
export default function MarketActivityPicker() {
  const { close } = useModalRequest<void, string>()

  return (
    <Backdrop>
      <ActivityTypeOption onSelect={close} />
    </Backdrop>
  )
}
