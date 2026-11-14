export function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRadians = (degree: number): number => (degree * Math.PI) / 180

  const R = 6371000 // Radius of the Earth in meters
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in meters

  return distance
}

export const formatNumber = (num: number) => {
  return num
    .toFixed(2) // Converts to string with 2 decimal places (e.g., "2000.00")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",") // Adds commas as thousand separators
}

export function formatNumberShort(num: number): string {
  if (num >= 1_000_000_000_000) {
    return (
      (num / 1_000_000_000_000).toFixed(num % 1_000_000_000_000 === 0 ? 0 : 1) +
      "T"
    )
  } else if (num >= 1_000_000_000) {
    return (
      (num / 1_000_000_000).toFixed(num % 1_000_000_000 === 0 ? 0 : 1) + "B"
    )
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1) + "M"
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1) + "K"
  }
  return num.toString()
}

export function formatNegativeNumber(num: number): string {
  if (num < 0) {
    const positiveNum = Math.abs(Number(num))
    return `(${formatNumber(positiveNum)})`
  } else {
    return formatNumber(num)
  }
}

export function formatNegativeNumberWithShortNumber(num: number): string {
  if (num < 0) {
    const positiveNum = Math.abs(Number(num))
    return `(${formatNumberShort(positiveNum)})`
  } else {
    return formatNumberShort(num)
  }
}

export function isValidWholePositive(value: any): boolean {
  // Allow strings or numbers, but must be an integer without dot
  if (typeof value === "number") {
    // Must be integer, positive, no decimal part, no leading zero issue in number
    return Number.isInteger(value) && value > 0
  }

  if (typeof value === "string") {
    // Reject if contains dot or leading zeros
    if (!/^[1-9][0-9]*$/.test(value)) {
      return false
    }

    const num = Number(value)
    return Number.isInteger(num) && num > 0
  }

  return false
}

export const isValidMoney = (value: string): boolean => {
  return /^(\d+)(\.\d{1,2})?$/.test(value)
}

export const isWholeNumberString = (value: string): boolean => {
  return /^(0|[1-9][0-9]*)$/.test(value)
}
