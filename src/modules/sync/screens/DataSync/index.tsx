import { useNetInfo } from "@react-native-community/netinfo"
import { router } from "expo-router"
import { useState } from "react"
import styled from "styled-components/native"
import { Button, Card, Container, UserCard } from "@/components"
import Icon from "@/components/Icon"
import { color } from "@/constants/theme"
import { alert, openModalRoute } from "@/lib/modal"
import { MaterialIcon } from "@/types/icon.enum"

const Actions = styled.View`
  flex-direction: row;
  justify-content: space-evenly;
  margin-top: 12px;
`

const Content = styled.View`
  width: 100%;
`

const Title = styled.Text`
  text-align: center;
  margin-top: 8px;
  font-size: 18px;
`

const Description = styled.Text`
  text-align: center;
  margin-top: 20px;
`

const Errors = styled.View`
  margin-top: 12px;
`

const ErrorText = styled.Text``

const ErrorRow = styled.View`
  padding: 8px;
  flex-direction: row;
  align-items: center;
  gap: 20px;
`

export default function DataSync() {
  const { isConnected } = useNetInfo()
  const [errors, setErrors] = useState<string[]>([])

  async function handleSync() {
    if (!isConnected) {
      await alert({
        title: "Sync Failed",
        message:
          "No internet connection. Please check your connection and try again.",
        singleButtonText: "Continue",
      })
      return
    }

    setErrors([])
    const result = await openModalRoute<undefined, string[]>(
      "/sync-progress",
      undefined,
    )
    if (result) {
      setErrors(result)
    }
  }

  return (
    <Container>
      <UserCard />
      <Actions>
        <Button
          title="SYNC"
          buttonColor="tertiary"
          width={150}
          onPress={handleSync}
        />
        <Button
          title="CANCEL"
          buttonColor="danger"
          width={150}
          onPress={() => router.back()}
        />
      </Actions>
      <Content>
        <Card
          cardStyle={{
            marginVertical: 12,
            paddingVertical: 16,
            paddingHorizontal: 12,
            backgroundColor: color.white,
          }}
        >
          <Title>Synchronize Data</Title>
          <Description>
            Tap the &apos;Sync&apos; button to update your data in real time. It
            keeps everything accurate and up to date.
          </Description>
          <Errors>
            {errors.map(error => (
              <ErrorRow key={error}>
                <Icon name={MaterialIcon.CLOSE} size={14} color={color.red} />
                <ErrorText>{error}</ErrorText>
              </ErrorRow>
            ))}
          </Errors>
        </Card>
      </Content>
    </Container>
  )
}
