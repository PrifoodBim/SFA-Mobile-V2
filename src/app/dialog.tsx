import styled from "styled-components/native"
import ModalDisplay from "@/components/ModalDisplay"
import { DialogOptions, useModalRequest } from "@/lib/modal"

const Backdrop = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
`

export default function DialogModal() {
  const { options, close } = useModalRequest<DialogOptions, boolean>()

  if (!options) {
    return null
  }

  return (
    <Backdrop>
      <ModalDisplay
        {...options}
        onSuccess={() => close(true)}
        onCancel={() => close(false)}
      />
    </Backdrop>
  )
}
