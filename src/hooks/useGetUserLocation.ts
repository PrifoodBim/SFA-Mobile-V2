import { LatLng } from "@/types/location.type"
import * as Location from "expo-location"
import { useState } from "react"

/** Same codes as the old geolocation API: callers check for "3" (timeout). */
const POSITION_UNAVAILABLE = "2"
const TIMEOUT = "3"

/** Accept a fix up to 10s old so a cold GPS is not awaited every time. */
const MAX_AGE_MS = 10000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(TIMEOUT)), ms)
    promise.then(
      value => {
        clearTimeout(timer)
        resolve(value)
      },
      error => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

async function fetchPosition(highAccuracy: boolean): Promise<LatLng> {
  const position = await withTimeout(
    Location.getCurrentPositionAsync({
      accuracy: highAccuracy
        ? Location.Accuracy.High
        : Location.Accuracy.Balanced,
    }),
    highAccuracy ? 10000 : 15000,
  )
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  }
}

export default function useGetUserLocation() {
  const [error, setError] = useState<string | null>(null)

  const requestPermission = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync()
    return granted
  }

  /**
   * Current position, or `null` when location permission is denied.
   * Throws `Error("3")` when no position could be obtained in time.
   */
  const getLocation = async (): Promise<LatLng | null> => {
    try {
      const isGranted = await requestPermission()
      if (!isGranted) {
        return null
      }

      const recent = await Location.getLastKnownPositionAsync({
        maxAge: MAX_AGE_MS,
      })
      if (recent) {
        setError(null)
        return {
          latitude: recent.coords.latitude,
          longitude: recent.coords.longitude,
        }
      }

      // GPS first; on failure fall back to network / wifi location.
      let coordinates: LatLng
      try {
        coordinates = await fetchPosition(true)
      } catch {
        coordinates = await fetchPosition(false)
      }
      setError(null)
      return coordinates
    } catch (err) {
      const code =
        err instanceof Error && err.message === TIMEOUT
          ? TIMEOUT
          : POSITION_UNAVAILABLE
      setError(`${err}`)
      throw new Error(code)
    }
  }

  return {
    getLocation,
    error,
  }
}
