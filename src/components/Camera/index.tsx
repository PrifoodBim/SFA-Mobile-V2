import { CameraType, CameraView, useCameraPermissions } from "expo-camera"
import { File, Paths } from "expo-file-system"
import { router } from "expo-router"
import { useRef, useState } from "react"
import { Text } from "react-native"
import styled from "styled-components/native"
import { color } from "@/constants/theme"
import { hideLoading, showLoading } from "@/lib/modal"
import { compressImage } from "@/utils/image.utils"
import Button from "../Button"

type Props = {
  /**
   * Called with the `file://` uri of the compressed photo saved in the document
   * directory. The loader stays up until it resolves, then the camera closes.
   */
  setPhoto: (photo: string) => void | Promise<void>
  cameraPosition?: CameraType
}

const Wrapper = styled.View`
  flex: 1;
  width: 100%;
`

const Preview = styled(CameraView)`
  flex: 1;
  width: 100%;
`

const BottomBar = styled.View`
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 12px 0;
`

const Notice = styled.Text`
  text-align: center;
  color: ${props => props.theme.color.white};
`

const Actions = styled.View`
  margin-top: 12px;
  flex-direction: row;
  justify-content: space-evenly;
`

const TopRight = styled.View`
  position: absolute;
  top: 0;
  right: 0;
  padding: 12px;
`

/** Full-size camera preview with capture, cancel and front/back switch buttons. */
export default function Camera(props: Readonly<Props>) {
  const { setPhoto, cameraPosition = "back" } = props
  const [facing, setFacing] = useState<CameraType>(cameraPosition)
  const [permission] = useCameraPermissions({ request: true })
  const cameraRef = useRef<CameraView>(null)
  const isCapturing = useRef(false)

  async function takePhoto() {
    if (!cameraRef.current) {
      console.error("Camera reference not available.")
      return
    }
    // Ignore taps while a capture is still being processed.
    if (isCapturing.current) {
      return
    }
    isCapturing.current = true

    showLoading()
    try {
      const image = await cameraRef.current.takePictureAsync()
      const compressedUri = await compressImage(image.uri)
      const destination = new File(Paths.document, `image_${Date.now()}.jpg`)
      await new File(compressedUri).move(destination)
      // Wait for the location lookup + saving so the loader stays visible.
      await setPhoto(destination.uri)
      hideLoading()
      router.back()
    } catch (error) {
      console.error("Error capturing photo:", error)
      hideLoading()
    } finally {
      isCapturing.current = false
    }
  }

  if (!permission) {
    return <Text>Checking camera permission...</Text>
  }
  if (!permission.granted) {
    return <Text>Camera permission not granted</Text>
  }

  return (
    <Wrapper>
      <Preview ref={cameraRef} facing={facing} />
      <BottomBar>
        <Notice>TIME AND LOCATION WILL BE CAPTURE</Notice>
        <Actions>
          <Button
            title="Capture"
            width={150}
            buttonStyle={{ backgroundColor: color.gold }}
            textStyle={{ color: color.black }}
            onPress={takePhoto}
          />
          <Button
            title="Cancel"
            width={150}
            buttonColor="danger"
            onPress={() => router.back()}
          />
        </Actions>
      </BottomBar>
      <TopRight>
        <Button
          title={facing === "back" ? "Front Camera" : "Back Camera"}
          width={150}
          buttonStyle={{ backgroundColor: color.gold }}
          textStyle={{ color: color.black }}
          onPress={() => setFacing(facing === "back" ? "front" : "back")}
        />
      </TopRight>
    </Wrapper>
  )
}
