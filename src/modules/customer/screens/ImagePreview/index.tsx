import { router, useLocalSearchParams } from "expo-router"
import styled from "styled-components/native"
import Icon from "@/components/Icon"
import { color } from "@/constants/theme"
import { MaterialIcon } from "@/types/icon.enum"

const Backdrop = styled.View`
  flex: 1;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
`

const Content = styled.View`
  position: relative;
  width: 90%;
  height: 450px;
  align-self: center;
`

const CloseButton = styled.TouchableOpacity`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 50;
`

const Preview = styled.Image`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  border-width: 1px;
  border-color: ${props => props.theme.color.blue400};
  background-color: ${props => props.theme.color.white};
`

/**
 * Full-size product image (modal route `/image-preview?uri=…`),
 * opened when a product thumbnail is pressed.
 */
export default function ImagePreview() {
  const { uri } = useLocalSearchParams<{ uri: string }>()

  return (
    <Backdrop>
      <Content>
        {uri ? <Preview source={{ uri }} resizeMode="contain" /> : null}
        <CloseButton onPress={() => router.back()}>
          <Icon name={MaterialIcon.CLOSE} size={23} color={color.grey500} />
        </CloseButton>
      </Content>
    </Backdrop>
  )
}
