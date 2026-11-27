import { useState } from "react"
import styled from "styled-components/native"
import { color } from "@/constants/theme"
import { useModalRequest } from "@/lib/modal"
import { dateFormat } from "@/utils/date.utils"
import Button from "../Button"
import CalendarDisplay from "./components/CalendarDisplay"
import MonthList from "./components/MonthList"
import YearList from "./components/YearList"
import { CalendarOptions, CalendarState } from "./types"

const Backdrop = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
`

const Sheet = styled.View`
  width: 90%;
  height: 550px;
  padding: 12px;
  justify-content: center;
  border-radius: 6px;
  background-color: ${props => props.theme.color.white};
`

const TitleBar = styled.View`
  width: 100%;
  height: 50px;
  flex-direction: row;
  align-items: center;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  background-color: ${props => props.theme.color.blue400};
`

const Title = styled.Text`
  padding: 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.color.white};
`

const Body = styled.View`
  flex: 1;
  margin-top: 12px;
  align-items: center;
`

const DateToggle = styled.TouchableOpacity`
  align-self: flex-start;
`

const SelectedDate = styled.Text`
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.color.grey500};
`

const Actions = styled.View`
  margin-top: 24px;
  flex-direction: row;
  justify-content: space-between;
`

/** `/calendar` modal route: day / month / year picker opened by `pickDate`. */
export default function CalendarModalScreen() {
  const { options, close } = useModalRequest<CalendarOptions, Date>()
  const [calendarState, setCalendarState] = useState(CalendarState.DAY)
  const [selectedDate, setSelectedDate] = useState(
    dateFormat(new Date(), "YYYY-MM-DD"),
  )

  function renderCalendar() {
    switch (calendarState) {
      case CalendarState.DAY:
        return (
          <CalendarDisplay
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        )
      case CalendarState.MONTH:
        return (
          <MonthList
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onStateChange={setCalendarState}
          />
        )
      case CalendarState.YEAR:
        return (
          <YearList
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onStateChange={setCalendarState}
          />
        )
    }
  }

  return (
    <Backdrop>
      <Sheet>
        <TitleBar>
          <Title>{options?.title}</Title>
        </TitleBar>
        <Body>
          <DateToggle onPress={() => setCalendarState(CalendarState.YEAR)}>
            <SelectedDate>
              {dateFormat(selectedDate, "MMM DD,YYYY")}
            </SelectedDate>
          </DateToggle>
          {renderCalendar()}
        </Body>
        <Actions>
          <Button
            title="Cancel"
            buttonStyle={{ width: "30%", backgroundColor: color.white }}
            textStyle={{ color: color.red }}
            onPress={() => close(undefined)}
          />
          <Button
            title="Okay"
            buttonStyle={{ width: "30%", backgroundColor: color.white }}
            textStyle={{ color: color.blue400 }}
            onPress={() => close(new Date(selectedDate))}
          />
        </Actions>
      </Sheet>
    </Backdrop>
  )
}
