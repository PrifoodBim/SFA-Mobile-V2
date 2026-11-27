import { Calendar, DateData } from "react-native-calendars"
import { CalendarViewProps } from "../../types"

export default function CalendarDisplay(props: Readonly<CalendarViewProps>) {
  const { selectedDate, setSelectedDate } = props

  return (
    <Calendar
      current={selectedDate || undefined}
      style={{ width: "100%", height: 250 }}
      theme={{
        backgroundColor: "white",
        calendarBackground: "white",
        textSectionTitleColor: "#b6c1cd",
        selectedDayBackgroundColor: "#00adf5",
        selectedDayTextColor: "white",
        todayTextColor: "#00adf5",
        dayTextColor: "black",
        textDisabledColor: "#d9e1e8",
        arrowColor: "#00adf5",
        monthTextColor: "black",
        indicatorColor: "blue",
      }}
      markedDates={
        selectedDate
          ? {
              [selectedDate]: { selected: true },
            }
          : {}
      }
      hideExtraDays
      onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
    />
  )
}
