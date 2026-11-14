import { FlatList } from "react-native"
import styled from "styled-components/native"
import Button from "@/components/Button"
import RadioButton from "@/components/RadioButton"
import { color } from "@/constants/theme"
import { Option } from "@/db/models/Option.model"

type Props = {
  title: string
  options: Option[]
  selectedCode: string
  onChange: (code: string) => void
  onContinue: () => void
}

const Card = styled.View`
  width: 256px;
  padding: 12px;
  align-self: center;
  border-radius: 8px;
  background-color: ${props => props.theme.color.gold};
`

const Title = styled.Text`
  font-size: 18px;
  font-weight: bold;
  text-align: center;
`

const ListWrapper = styled.View`
  width: 70%;
  margin-top: 12px;
  align-self: center;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 12px;
`

const Separator = styled.View`
  height: 12px;
`

/** Radio list of options with a "Continue" button (used by the picker modals). */
export default function OptionRadioCard(props: Readonly<Props>) {
  const { title, options, selectedCode, onChange, onContinue } = props

  return (
    <Card>
      <Title>{title}</Title>
      <ListWrapper>
        <FlatList
          data={options}
          keyExtractor={item => item.code}
          renderItem={({ item }) => (
            <RadioButton
              isSelected={item.code === selectedCode}
              label={item.value}
              value={item.code}
              onSelect={() => onChange(item.code)}
            />
          )}
          contentContainerStyle={{ alignItems: "flex-start" }}
          ItemSeparatorComponent={Separator}
        />
      </ListWrapper>
      <Button
        width={150}
        buttonStyle={{
          backgroundColor: color.green,
          marginTop: 20,
          alignSelf: "center",
        }}
        title="Continue"
        onPress={onContinue}
      />
    </Card>
  )
}
