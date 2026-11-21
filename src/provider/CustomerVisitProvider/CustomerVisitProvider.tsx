import { useState } from "react"
import { ImageDetails } from "@/types/image.type"
import { LatLng } from "@/types/location.type"
import createAppContext from "@/utils/context.utils"

/** State of the customer visit in progress. */
type CustomerVisitContextType = {
  /** Code of the customer being visited. */
  selectedCustomer: string | null
  setSelectedCustomer: (customerCode: string | null) => void
  /** Location logged when the visit started (fallback for photos). */
  latLng: LatLng
  setLatLng: (latLng: LatLng) => void
  /** Photos captured by the camera screen for the current transaction. */
  photos: ImageDetails[]
  setPhotos: (photos: ImageDetails[]) => void
}

type Props = {
  children: React.ReactNode
}

const [useCustomerVisitContext, CustomerVisitContextProvider] =
  createAppContext<CustomerVisitContextType>()

function CustomerVisitProvider(props: Readonly<Props>) {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [latLng, setLatLng] = useState<LatLng>({ latitude: 0, longitude: 0 })
  const [photos, setPhotos] = useState<ImageDetails[]>([])

  return (
    <CustomerVisitContextProvider
      value={{
        selectedCustomer,
        setSelectedCustomer,
        latLng,
        setLatLng,
        photos,
        setPhotos,
      }}
    >
      {props.children}
    </CustomerVisitContextProvider>
  )
}

export { CustomerVisitProvider, useCustomerVisitContext }
