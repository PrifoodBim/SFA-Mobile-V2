import { useLocalSearchParams } from "expo-router"
import styled from "styled-components/native"
import { Camera as CameraView } from "@/components"
import useGetUserLocation from "@/hooks/useGetUserLocation"
import { useCustomerVisitContext } from "@/provider/CustomerVisitProvider/CustomerVisitProvider"
import { ImageDetails } from "@/types/image.type"
import { LatLng } from "@/types/location.type"

type Params = {
  /** "MARKET" keeps a single photo, "PLANOGRAM" fills the before/after slots. */
  insertInto?: string
  /** Photo slot to fill (number as string). */
  index?: string
}

const Screen = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

function replaceAt(
  photos: ImageDetails[],
  index: number,
  payload: ImageDetails,
) {
  return photos.map((val, idx) =>
    idx === index ? { ...val, ...payload } : val,
  )
}

export default function Camera() {
  const params = useLocalSearchParams<Params>()
  const { photos, setPhotos, latLng } = useCustomerVisitContext()
  const { getLocation } = useGetUserLocation()
  const insertTo = params.insertInto
  const index = params.index === undefined ? undefined : Number(params.index)

  async function handleTakePicture(uri: string) {
    if (!uri) {
      return
    }
    // Photos are stored as plain paths; screens add the `file://` prefix.
    const path = uri.replace(/^file:\/\//, "")
    try {
      const location = await getLocation()
      handleCameraSaving(location ?? latLng, path)
    } catch {
      handleCameraSaving(latLng, path)
    }
    // The Camera component closes this screen once the photo is saved.
  }

  function getUpdatedPhotos(payload: ImageDetails): ImageDetails[] {
    if (insertTo === "MARKET") {
      return [payload]
    }

    if (insertTo === "PLANOGRAM") {
      if (index === 0) {
        return photos.length > 0 ? replaceAt(photos, 0, payload) : [payload]
      }
      if (index === 1) {
        return photos.length > 1
          ? replaceAt(photos, 1, payload)
          : [...photos, payload]
      }
    }

    if (index === undefined || photos.length < 2) {
      return [...photos, payload]
    }
    return replaceAt(photos, index, payload)
  }

  function handleCameraSaving(location: LatLng, path: string) {
    setPhotos(
      getUpdatedPhotos({
        fileName: path,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
      }),
    )
  }

  return (
    <Screen>
      <CameraView setPhoto={handleTakePicture} />
    </Screen>
  )
}
