import { useState } from "react"
import { useQuery } from "@/db"
import { OptionModel } from "@/db/models/Option.model"
import { OptionTypeEnum } from "@/types/Option.type"
import OptionRadioCard from "../OptionRadioCard"

type Props = {
  onSelect: (selectedOption: string) => void
}

export default function SelectInventoryStatusOption(props: Readonly<Props>) {
  const { onSelect } = props
  const options = useQuery(OptionModel, {
    where: { type: OptionTypeEnum.INVENTORY_STATUS },
  })
  const [selectedOption, setSelectedOption] = useState<string>(
    options[0]?.code ?? "",
  )

  return (
    <OptionRadioCard
      title="Select Status"
      options={options}
      selectedCode={selectedOption}
      onChange={setSelectedOption}
      onContinue={() => onSelect(selectedOption)}
    />
  )
}
