import { FlatList } from "react-native"
import styled from "styled-components/native"
import { CalendarState, CalendarViewProps } from "../../types"

type Props = CalendarViewProps & {
  onStateChange: (state: CalendarState) => void
}

const START_YEAR = 2005

const Container = styled.View`
  flex: 1;
`

const Item = styled.TouchableOpacity<{ $selected: boolean }>`
  margin: 0 4px;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: ${props =>
    props.$selected ? props.theme.color.blue400 : "transparent"};
`

const Label = styled.Text<{ $selected: boolean }>`
  font-size: ${props => props.theme.fontSize.regular}px;
  font-weight: bold;
  text-align: center;
  color: ${props => (props.$selected ? "#ffffff" : "gray")};
`

function getYears() {
  const endYear = new Date().getFullYear() + 5
  const years: number[] = []
  for (let year = START_YEAR; year <= endYear; year++) {
    years.push(year)
  }
  return years
}

export default function YearList(props: Readonly<Props>) {
  const { selectedDate, setSelectedDate, onStateChange } = props
  const selectedYear = selectedDate.split("-")[0]
  const years = getYears()

  function onYearSelect(year: number) {
    if (selectedDate === "") {
      setSelectedDate(`${year}-01-01`)
    } else {
      setSelectedDate(`${year}-${selectedDate.slice(5)}`)
    }
    onStateChange(CalendarState.MONTH)
  }

  return (
    <Container>
      <FlatList
        data={years}
        keyExtractor={item => item.toString()}
        numColumns={4}
        contentContainerStyle={{ padding: 8 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: year }) => {
          const isSelected = year.toString() === selectedYear
          return (
            <Item $selected={isSelected} onPress={() => onYearSelect(year)}>
              <Label $selected={isSelected}>{year}</Label>
            </Item>
          )
        }}
      />
    </Container>
  )
}
