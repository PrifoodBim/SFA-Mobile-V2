import { Button, PasswordInput, TextInput } from "@/components"
import { LOGIN_BACKGROUND, LOGO } from "@/constants/images"
import { Route } from "@/constants/routes"
import { color } from "@/constants/theme"
import useGetUserLocation from "@/hooks/useGetUserLocation"
import useKeyboardVisible from "@/hooks/useKeyboardVisible"
import { alert, showLoading } from "@/lib/modal"
import AuthFooter from "@/modules/auth/components/AuthFooter"
import useLogin from "@/modules/auth/hooks/useLogin"
import useValidateInput from "@/modules/auth/hooks/useValidateInput"
import {
  authLabelStyle,
  Background,
  Content,
  Fields,
  LinkButton,
  LinkText,
  Logo,
  LogoWrapper,
  Subtitle,
  Title,
} from "@/modules/auth/styles"
import { getDataFromStorage, KEY } from "@/utils/storage.utils"
import { useNetInfo } from "@react-native-community/netinfo"
import { router } from "expo-router"
import { ScrollView } from "react-native"

export default function Login() {
  const { isConnected } = useNetInfo()
  const isKeyboardVisible = useKeyboardVisible()
  const { getLocation } = useGetUserLocation()
  const { getAuth } = useLogin()
  const {
    email,
    setEmail,
    password,
    setPassword,
    emailError,
    passwordError,
    isValidData,
  } = useValidateInput()

  async function handleSignIn() {
    try {
      if (!isValidData()) {
        return
      }

      showLoading()

      if (!isConnected) {
        await alert({
          title: "Sign in Failed",
          message:
            "No internet connection. Please check your connection and try again.",
          singleButtonText: "Retry",
        })
        return
      }

      const location = await getLocation()
      if (!location) {
        await alert({
          title: "Location Required",
          message:
            "To use this feature, please enable location services (GPS) in your phone’s settings.",
          singleButtonText: "Retry",
        })
        return
      }

      const userId = await getDataFromStorage<string>(KEY.USER_ID)
      if (userId && userId !== email) {
        await alert({
          title: "Access Denied",
          message:
            "Unauthorized User ID detected. Please use the registered User ID for this mobile.",
          singleButtonText: "Retry",
        })
        return
      }

      await getAuth(
        { userNameOrEmailAddress: email, password },
        location,
        clearData,
      )
    } catch (error) {
      console.error("ERROR", error)
      await alert({
        title: "Sign in Failed",
        message:
          "GPS location access is required. Please enable GPS or find a better location and try again.",
        singleButtonText: "Retry",
      })
    }
  }

  function clearData() {
    setEmail("")
    setPassword("")
  }

  return (
    <Background source={LOGIN_BACKGROUND}>
      <ScrollView>
        <LogoWrapper>
          <Logo source={LOGO} resizeMode="contain" />
        </LogoWrapper>
        <Content>
          <Title>Sales Force Automation</Title>
          <Subtitle>Enter your credentials to start using this app</Subtitle>
          <Fields $gap={12}>
            <TextInput
              errorText={emailError}
              onChangeText={setEmail}
              labelStyle={authLabelStyle}
              label="User ID"
              placeholder="Enter User ID"
              value={email}
            />
            <PasswordInput
              errorText={passwordError}
              onChangeText={setPassword}
              labelStyle={authLabelStyle}
              label="Password"
              placeholder="Enter Password"
              value={password}
            />
          </Fields>
        </Content>
        <Button
          title="Sign in"
          width={100}
          onPress={handleSignIn}
          buttonStyle={{ marginTop: 20, alignSelf: "center" }}
        />
        <LinkButton onPress={() => router.push(Route.FORGOT_PASSWORD)}>
          <LinkText>Password Forgot?</LinkText>
        </LinkButton>
      </ScrollView>
      {!isKeyboardVisible && (
        <AuthFooter isFloating buildColor={color.yellow400} />
      )}
    </Background>
  )
}
