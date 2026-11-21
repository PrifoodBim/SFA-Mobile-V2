import { ImageBackground, StyleSheet, View } from "react-native"
import { BACKGROUND } from "@/constants/images"
import { spacing } from "@/constants/theme"

type Props = {
  children: React.ReactNode
  /** Draws the app background image. Off for screens on the plain background. */
  background?: boolean
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: spacing.gap,
    paddingHorizontal: spacing.screen,
  },
})

/**
 * Screen wrapper: applies the standard screen spacing (see `spacing` in the
 * theme) so every page lines up with Home.
 */
export default function Container(props: Readonly<Props>) {
  const { children, background = true } = props
  if (!background) {
    return <View style={styles.screen}>{children}</View>
  }
  return (
    <ImageBackground source={BACKGROUND} style={styles.screen}>
      {children}
    </ImageBackground>
  )
}
