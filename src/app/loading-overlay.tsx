import LottieView from "lottie-react-native"
import { useEffect } from "react"
import { BackHandler } from "react-native"
import styled from "styled-components/native"
import { LOTTIE } from "@/constants/images"

const Backdrop = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
`

/** Opened with `showLoading()`, closed with `hideLoading()`. */
export default function LoadingOverlay() {
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    )
    return () => subscription.remove()
  }, [])

  return (
    <Backdrop>
      <LottieView
        source={LOTTIE.loading}
        autoPlay
        loop
        style={{ width: 80, height: 80 }}
      />
    </Backdrop>
  )
}
