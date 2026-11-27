import styled from "styled-components/native"
import { color } from "@/constants/theme"

/** Shared layout of the login / forgot-password screens. */

export const Background = styled.ImageBackground`
  flex: 1;
`

export const LogoWrapper = styled.View`
  width: 100%;
  height: 35%;
  justify-content: flex-end;
  align-items: center;
`

export const Logo = styled.Image`
  width: 200px;
  height: 200px;
`

export const Content = styled.View`
  width: 80%;
  align-self: center;
`

export const Title = styled.Text`
  text-align: center;
  font-size: 20px;
  line-height: 40px;
  font-weight: 600;
  color: ${props => props.theme.color.blue400};
`

export const Subtitle = styled.Text`
  text-align: center;
  font-size: 14px;
  color: ${props => props.theme.color.green};
`

export const Fields = styled.View<{ $gap: number }>`
  gap: ${props => props.$gap}px;
  margin-top: 20px;
`

export const LinkButton = styled.TouchableOpacity`
  margin-top: 12px;
`

export const LinkText = styled.Text`
  text-align: center;
  font-size: 15px;
  font-weight: 700;
  text-decoration-line: underline;
  color: ${props => props.theme.color.black};
`

/** Label style passed to the shared TextInput / PasswordInput. */
export const authLabelStyle = {
  color: color.black,
  paddingBottom: 8,
  fontWeight: "600",
} as const
