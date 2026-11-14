import { router, useLocalSearchParams } from "expo-router"
import { Dimensions, ScrollView } from "react-native"
import styled from "styled-components/native"
import { Container, UserCard } from "@/components"
import SizeBox from "@/components/SizeBox"
import { findById } from "@/db"
import { AlertModel } from "@/modules/alerts/models/Alert.model"
import { dateFormat } from "@/utils/date.utils"
import { getImage } from "@/utils/image.utils"

const { width, height } = Dimensions.get("window")

const Content = styled.View`
  flex: 1;
  gap: 12px;
`

const DetailCard = styled.View`
  width: 90%;
  align-self: center;
  margin: 12px 0;
  padding: 12px;
  border-radius: 6px;
  background-color: ${props => props.theme.color.white};
`

const Title = styled.Text`
  width: 80%;
  color: ${props => props.theme.color.blue400};
`

const AlertImage = styled.Image`
  width: ${width * 0.9}px;
  height: ${height * 0.5}px;
  align-self: center;
`

const AlertDate = styled.Text`
  text-align: center;
  font-size: 14px;
  color: ${props => props.theme.color.grey};
`

const Message = styled.Text`
  text-align: center;
  font-size: 14px;
`

const CloseText = styled.Text`
  text-align: center;
  color: ${props => props.theme.color.red};
`

export default function AlertDetails() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const alert = id ? findById(AlertModel, id) : undefined

  if (!alert) {
    return null
  }

  return (
    <Container padding={10}>
      <Content>
        <UserCard />
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <DetailCard>
            <Title>{alert.alertTitle}</Title>
            <SizeBox height={10} />
            <AlertImage
              source={{ uri: getImage(alert.imageFileObjectId + ".png") }}
              resizeMode="contain"
            />
            <SizeBox height={10} />
            <AlertDate>{dateFormat(alert.alertDate, "MMM DD, YYYY")}</AlertDate>
            <SizeBox height={10} />
            <Message>{alert.alertMessage}</Message>
            <SizeBox height={15} />
            <CloseText onPress={() => router.back()}>Close</CloseText>
          </DetailCard>
        </ScrollView>
      </Content>
    </Container>
  )
}
