import { StyleProp, TouchableOpacityProps, ViewStyle } from "react-native"
import styled from "styled-components/native"

type Props = TouchableOpacityProps & {
  children: React.ReactNode
  isPressable?: boolean
  cardStyle?: StyleProp<ViewStyle>
}

const Box = styled.View`
  border-radius: 8px;
  background-color: ${props => props.theme.color.green};
`

const PressableBox = styled.TouchableOpacity`
  border-radius: 8px;
  background-color: ${props => props.theme.color.green};
`

/** Green rounded card; pressable when `isPressable` is set. */
export default function Card(props: Readonly<Props>) {
  const { isPressable = false, children, cardStyle, ...rest } = props

  if (isPressable) {
    return (
      <PressableBox style={cardStyle} {...rest}>
        {children}
      </PressableBox>
    )
  }

  return <Box style={cardStyle}>{children}</Box>
}
