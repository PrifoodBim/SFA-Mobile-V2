import { defineCollection } from "@/db"

export type Customer = {
  _id: string
  code: string
  name: string
  parentCode?: string
  parentName?: string
  address?: string
  city?: string
  province?: string
  postal?: string
  country?: string
  latitude?: string
  longitude?: string
  territoryCode?: string
  territoryName?: string
  classCode?: string
  className?: string
  sectorCode?: string
  sectorName?: string
  subSectorCode?: string
  sectorSubName?: string
  areaCode?: string
  areaName?: string
  statusCode?: string
  statusName?: string
  plantId?: string
  warehouseId?: string
  salesAgentUserId: string
  salesAgentName: string
  priceList?: string
  fileData?: string
  lastModificationTime: string
  /** 1 while the customer image still has to be downloaded. */
  isUpdated: number
  /** `lastModificationTime` at which the server had no image (404), so it isn't asked again until the customer changes. */
  imageNotFoundAt?: string
  contactName1?: string
  mobile1?: string
  email1?: string
  frequency?: string
  paymentTerms?: string
  channel?: string
  channelName?: string
}

export const CustomerModel = defineCollection<Customer>({
  name: "CustomerModel",
})
