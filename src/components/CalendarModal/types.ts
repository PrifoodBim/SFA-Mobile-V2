export enum CalendarState {
  DAY = "DAY",
  MONTH = "MONTH",
  YEAR = "YEAR",
}

export type CalendarOptions = {
  title: string
}

/** Props shared by the day / month / year views; dates are `YYYY-MM-DD`. */
export type CalendarViewProps = {
  selectedDate: string
  setSelectedDate: (date: string) => void
}
