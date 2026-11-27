import { LatLng } from "./location.type"

export type AuthPayload = {
  userNameOrEmailAddress: string
  password: string
}

export type AuthResponse = {
  accessToken: string
  expireInSeconds: number
  refreshToken: string
  userId: number
}

export type StorageAuthType = AuthResponse &
  LatLng & {
    expiryDate: string
  }
