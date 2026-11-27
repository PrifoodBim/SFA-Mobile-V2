import styled from "styled-components/native"
import Button from "@/components/Button"
import { MaterialIcon } from "@/types/icon.enum"

type Props = {
  onSave: () => void
  onCancel: () => void
}

const Row = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-evenly;
  margin-top: 12px;
`

/** Save / Cancel row shown on top of the customer transaction screens. */
export default function SaveCancelButtons(props: Readonly<Props>) {
  return (
    <Row>
      <Button
        onPress={props.onSave}
        icon={MaterialIcon.ARROW_RIGHT_OUTLINE}
        title="Save"
        buttonColor="primary"
        width={150}
      />
      <Button
        onPress={props.onCancel}
        icon={MaterialIcon.CLOSE_BOX_OUTLINE}
        title="Cancel"
        buttonColor="danger"
        width={150}
      />
    </Row>
  )
}
