import { useEffect, useState } from "react"
import { ImageBackground } from "react-native"
import styled from "styled-components/native"
import { NO_IMAGE } from "@/constants/images"
import { color } from "@/constants/theme"
import { getImage } from "@/utils/image.utils"
import { getDataFromStorage, KEY } from "@/utils/storage.utils"
import Card from "../Card"

type StoredUser = {
  empId: string
  name: string
  position: string
}

type Props = {
  /** Shows the signed-in user; otherwise `name` / `description`. */
  isCurrentUserInfo?: boolean
  name?: string
  /** Second line; also the image file name when not the current user. */
  description?: string
}

const Wrapper = styled.View`
  margin-top: 12px;
  padding: 0 12px;
`

const Row = styled.View`
  flex-direction: row;
  gap: 12px;
`

const Placeholder = styled.View`
  width: 64px;
  height: 64px;
  border-radius: 6px;
  background-color: ${props => props.theme.color.grey300};
`

const Avatar = styled.Image`
  width: 64px;
  height: 64px;
  border-radius: 8px;
`

const Info = styled.View`
  flex: 1;
  justify-content: center;
`

const Line = styled.Text`
  color: ${props => props.theme.color.white};
`

/** Blue banner with an avatar and two lines of user/customer info. */
export default function UserCard(props: Readonly<Props>) {
  const { isCurrentUserInfo = true, name, description } = props
  const [user, setUser] = useState<StoredUser | null>(null)

  useEffect(() => {
    getDataFromStorage<StoredUser>(KEY.USER)
      .then(setUser)
      .catch(() => setUser(null))
  }, [])

  const content = isCurrentUserInfo
    ? { name: user?.name || "", description: user?.position || "" }
    : { name, description }

  const imageName = isCurrentUserInfo ? user?.empId : description
  const showImage = !isCurrentUserInfo || !!user

  return (
    <Wrapper>
      <Card
        cardStyle={{
          justifyContent: "center",
          padding: 8,
          backgroundColor: color.blue300,
        }}
      >
        <Row>
          {showImage ? (
            <ImageBackground source={NO_IMAGE}>
              <Avatar source={{ uri: getImage(`${imageName}.png`) }} />
            </ImageBackground>
          ) : (
            <Placeholder />
          )}
          <Info>
            <Line>{content.name}</Line>
            <Line>{content.description}</Line>
          </Info>
        </Row>
      </Card>
    </Wrapper>
  )
}
