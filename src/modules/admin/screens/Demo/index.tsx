import Carousel from "pinar"
import { useState } from "react"
import { Dimensions } from "react-native"
import { Dropdown } from "react-native-element-dropdown"
import styled from "styled-components/native"
import { Container, UserCard } from "@/components"
import SizeBox from "@/components/SizeBox"
import { color } from "@/constants/theme"
import { query, useQuery } from "@/db"
import { DemoModel } from "@/db/models/Demo.model"
import { OptionModel } from "@/db/models/Option.model"
import { OptionTypeEnum } from "@/types/Option.type"
import { getImage } from "@/utils/image.utils"

const WIDTH = Dimensions.get("window").width

const SelectWrapper = styled.View`
  width: 90%;
  align-self: center;
  margin-top: 12px;
`

const SelectTitle = styled.Text`
  text-align: center;
  margin-top: 8px;
  font-size: 18px;
`

const Empty = styled.View`
  width: 100%;
  height: 300px;
  justify-content: center;
  align-items: center;
`

const Slide = styled.View`
  width: 100%;
  height: 100%;
  justify-content: flex-start;
  align-items: center;
`

const SlideImage = styled.Image`
  width: ${WIDTH}px;
  height: 400px;
`

const EmptyText = styled.Text``

export default function Demo() {
  const demoGroups = useQuery(OptionModel, {
    where: { type: OptionTypeEnum.DEMO_GROUPS },
  })
  const [value, setValue] = useState<string>()
  const [imageFileIds, setImageFileIds] = useState<string[]>([])

  const demoGroupOptions = demoGroups.map(option => ({
    label: option.value,
    value: option.code,
  }))

  function selectDemoGroup(groupCode: string) {
    setValue(groupCode)
    const demos = query(DemoModel, { where: { groupCode, status: "A" } })
    setImageFileIds(demos.map(demo => demo.imageFileObjectId))
  }

  return (
    <Container padding={10}>
      <UserCard />
      <SelectWrapper>
        <SelectTitle>Please Select</SelectTitle>
        <SizeBox height={10} />
        <Dropdown
          style={{
            width: 325,
            height: 40,
            alignSelf: "center",
            paddingHorizontal: 12,
            borderWidth: 1,
            borderRadius: 8,
            borderColor: color.grey300,
            backgroundColor: color.white,
          }}
          selectedTextStyle={{ color: color.grey500 }}
          data={demoGroupOptions}
          maxHeight={300}
          labelField="label"
          valueField="value"
          searchPlaceholder="Search..."
          placeholder="SELECT ITEM"
          value={value}
          onChange={item => selectDemoGroup(item.value)}
        />
      </SelectWrapper>
      <SizeBox height={12} />
      {imageFileIds.length < 1 ? (
        <Empty>
          <EmptyText>No Item For This Option</EmptyText>
        </Empty>
      ) : (
        <Carousel showsControls={false} loop>
          {imageFileIds.map((item, index) => (
            <Slide key={index}>
              <SlideImage
                source={{ uri: getImage(item + ".png") }}
                resizeMode="center"
              />
            </Slide>
          ))}
        </Carousel>
      )}
    </Container>
  )
}
