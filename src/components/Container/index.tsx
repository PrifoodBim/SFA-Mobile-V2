import styled from "styled-components/native"
import { BACKGROUND } from "@/constants/images"

type Props = {
  children: React.ReactNode
  padding?: number
}

const Background = styled.ImageBackground<{ $padding: number }>`
  flex: 1;
  padding: ${props => props.$padding}px;
`

/** Screen wrapper with the app background image. */
export default function Container(props: Readonly<Props>) {
  const { children, padding = 0 } = props
  return (
    <Background source={BACKGROUND} $padding={padding}>
      {children}
    </Background>
  )
}
