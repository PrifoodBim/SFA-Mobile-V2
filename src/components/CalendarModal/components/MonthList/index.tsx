import { FlatList } from "react-native"
import styled from "styled-components/native"
import { CalendarState, CalendarViewProps } from "../../types"

type Props = CalendarViewProps & {
  onStateChange: (state: CalendarState) => void
}

const MONTHS = [
  { short: "Jan", value: "01" },
  { short: "Feb", value: "02" },
  { short: "Mar", value: "03" },
  { short: "Apr", value: "04" },
  { short: "May", value: "05" },
  { short: "Jun", value: "06" },
  { short: "Jul", value: "07" },
  { short: "Aug", value: "08" },
  { short: "Sep", value: "09" },
  { short: "Oct", value: "10" },
  { short: "Nov", value: "11" },
  { short: "Dec", value: "12" },
]

const Container = styled.View`
  flex: 1;
`

const Item = styled.TouchableOpacity<{ $selected: boolean }>`
  margin: 4px;
  padding: 16px 12px;
  border-radius: 8px;
  background-color: ${props =>
    props.$selected ? props.theme.color.blue400 : "transparent"};
`

const Label = styled.Text<{ $selected: boolean }>`
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  color: ${props => (props.$selected ? "#ffffff" : "#1f2937")};
`

export default function MonthList(props: Readonly<Props>) {
  const { selectedDate, setSelectedDate, onStateChange } = props
  const [year, selectedMonth, day] = selectedDate.split("-")

  function onMonthSelect(month: string) {
    if (selectedDate === "") {
      setSelectedDate(`${new Date().getFullYear()}-${month}-01`)
    } else {
      setSelectedDate(`${year}-${month}-${day || "01"}`)
    }
    onStateChange(CalendarState.DAY)
  }

  return (
    <Container>
      <FlatList
        data={MONTHS}
        keyExtractor={item => item.value}
        numColumns={3}
        contentContainerStyle={{ padding: 8 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected = item.value === selectedMonth
          return (
            <Item
              $selected={isSelected}
              onPress={() => onMonthSelect(item.value)}
            >
              <Label $selected={isSelected}>{item.short}</Label>
            </Item>
          )
        }}
      />
    </Container>
  )
}
