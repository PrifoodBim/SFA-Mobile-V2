import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"

dayjs.extend(customParseFormat)

export const formatDate = (date: Date | string) => {
  const formattedDate = dayjs(date).format("MM-DD-YYYY")

  return formattedDate
}

export const dateFormat = (date: Date | string, format: string) => {
  return dayjs(date).format(format)
}
export const getMonth = (date: Date) => {
  return dayjs(date).month()
}

export const getYear = (date: Date) => {
  return dayjs(date).year()
}

export const configAuthDate = (min: number) => {
  const date = dayjs().add(min, "s")

  return date
}

export const isBefore = (date: string) => {
  return dayjs().isBefore(dayjs(date))
}

export const convertToDate = (date: string) => {
  return dayjs(date)
}

export const displayMonthAndYear = (date: Date | string) => {
  return dayjs(date).format("MMM-YYYY").toUpperCase()
}
