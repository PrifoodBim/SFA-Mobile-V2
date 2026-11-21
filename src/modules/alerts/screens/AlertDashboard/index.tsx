import { router } from "expo-router"
import { FlatList } from "react-native"
import styled from "styled-components/native"
import { Container, Icon, UserCard } from "@/components"
import SizeBox from "@/components/SizeBox"
import { Route } from "@/constants/routes"
import { color } from "@/constants/theme"
import { findOne, update, useQuery } from "@/db"
import { AlertModel } from "@/modules/alerts/models/Alert.model"
import { MaterialIcon } from "@/types/icon.enum"
import { dateFormat } from "@/utils/date.utils"

const Content = styled.View`
  flex: 1;
  gap: 12px;
`

const ListWrapper = styled.View`
  flex: 1;
  padding-bottom: 12px;
`

const AlertItem = styled.TouchableOpacity`
  padding: 12px;
  gap: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  background-color: ${props => props.theme.color.white};
`

const Row = styled.View`
  flex-direction: row;
`

const Body = styled.View`
  flex: 1;
  margin-left: 8px;
`

const AlertTitle = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.color.blue400};
`

const AlertMessage = styled.Text`
  margin-top: 4px;
  font-size: 14px;
  color: #6b7280;
`

const Footer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 8px;
`

const AlertDate = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.color.grey};
`

const More = styled.Text`
  font-size: 10px;
  color: ${props => props.theme.color.grey500};
`

export default function AlertDashboard() {
  const alerts = useQuery(AlertModel, {
    where: { statusName: "ACTIVE" },
    sort: { field: "alertDate", descending: true },
  })

  function markAlertAsRead(alertId: string) {
    try {
      const alert = findOne(AlertModel, { where: { alertId } })
      if (!alert) {
        return
      }
      update(AlertModel, alert._id, { isRead: 1 })
      router.push({ pathname: Route.ALERT_DETAILS, params: { id: alert._id } })
    } catch (error) {
      console.error("MARK AS READ ERROR", error)
    }
  }

  return (
    <Container>
      <Content>
        <UserCard />
        <ListWrapper>
          <SizeBox height={12} />
          <FlatList
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            data={alerts}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <AlertItem onPress={() => markAlertAsRead(item.alertId)}>
                <Row>
                  {item.isRead === 0 ? (
                    <Icon
                      name={MaterialIcon.MARK_EMAIL_UNREAD}
                      size={25}
                      color={color.red}
                    />
                  ) : (
                    <Icon
                      name={MaterialIcon.MARK_EMAIL_READ}
                      size={25}
                      color={color.blue400}
                    />
                  )}
                  <Body>
                    <AlertTitle>{item.alertTitle}</AlertTitle>
                    <AlertMessage>{item.alertMessage}</AlertMessage>
                    <Footer>
                      <AlertDate>
                        {dateFormat(item.alertDate, "MMM DD, YYYY")}
                      </AlertDate>
                      <More>MORE</More>
                    </Footer>
                  </Body>
                </Row>
              </AlertItem>
            )}
            style={{ marginTop: 4 }}
          />
        </ListWrapper>
      </Content>
    </Container>
  )
}
