import useScrollToFocusedInput from "@/hooks/useScrollToFocusedInput"
import { isAxiosError } from "axios"
import { router } from "expo-router"
import { useState } from "react"
import { KeyboardAvoidingView, ScrollView } from "react-native"
import { Button, TextInput } from "@/components"
import { FORGOT_PASSWORD_BG, LOGO } from "@/constants/images"
import { Route } from "@/constants/routes"
import { color } from "@/constants/theme"
import { alert } from "@/lib/modal"
import AuthFooter from "@/modules/auth/components/AuthFooter"
import useKeyboardVisible from "@/hooks/useKeyboardVisible"
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
import { sendEmailForgotPassword } from "@/services/account.service"

const EMAIL_PATTERN =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export default function ForgotPassword() {
  const keyboardScroll = useScrollToFocusedInput({ align: "nearest" })
  const isKeyboardVisible = useKeyboardVisible()
  const [email, setEmail] = useState<string>("")
  const [confirmEmail, setConfirmEmail] = useState<string>("")
  const [emailError, setEmailError] = useState<string>("")
  const [confirmEmailError, setConfirmEmailError] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  function clearErrors() {
    setEmailError("")
    setConfirmEmailError("")
  }

  function handleChangeEmail(value: string) {
    setEmail(value)
    clearErrors()
  }

  function handleChangeConfirmEmail(value: string) {
    setConfirmEmail(value)
    clearErrors()
  }

  function isDataValid() {
    if (!email) {
      setEmailError("Email is required")
      return false
    }

    if (!EMAIL_PATTERN.test(email)) {
      setEmailError("Invalid Email")
      return false
    }

    if (!confirmEmail) {
      setConfirmEmailError("Confirm email is required")
      return false
    }

    if (email !== confirmEmail) {
      alert({
        title: "Sending failed",
        message: "Email addresses do not match. Please check and try again",
        singleButtonText: "Retry",
      })
      return false
    }

    return true
  }

  async function handleSubmit() {
    try {
      if (!isDataValid()) {
        return
      }
      setIsLoading(true)
      const resp = await sendEmailForgotPassword(email)
      if (resp) {
        await alert({
          title: "Forgot Password",
          message:
            "Please check your email and follow the instructions to reset your password",
          singleButtonText: "Continue",
        })
        router.push({
          pathname: Route.FORGOT_PASSWORD_CHANGE_PASS,
          params: { email },
        })
      }
    } catch (error) {
      const message =
        (isAxiosError(error) && error.response?.data?.error?.message) ||
        "No internet connection. Please check your connection and try again."
      alert({ title: "Sending Failed", message, singleButtonText: "Retry" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Background source={FORGOT_PASSWORD_BG}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView {...keyboardScroll}>
          <LogoWrapper>
            <Logo source={LOGO} resizeMode="contain" />
          </LogoWrapper>
          <Content>
            <Title>Forgot Password?</Title>
            <Subtitle>Enter your registered email address.</Subtitle>
            <Fields $gap={20}>
              <TextInput
                labelStyle={authLabelStyle}
                label="Email"
                value={email}
                onChangeText={handleChangeEmail}
                errorText={emailError}
              />
              <TextInput
                labelStyle={authLabelStyle}
                label="Confirm Email"
                value={confirmEmail}
                onChangeText={handleChangeConfirmEmail}
                errorText={confirmEmailError}
              />
            </Fields>
            <Button
              title="Send"
              width={100}
              disabled={isLoading}
              buttonStyle={{ marginTop: 32, alignSelf: "center" }}
              onPress={handleSubmit}
            />
            <LinkButton onPress={() => router.back()}>
              <LinkText>Back</LinkText>
            </LinkButton>
          </Content>
        </ScrollView>
      </KeyboardAvoidingView>
      {!isKeyboardVisible && <AuthFooter buildColor={color.gold} />}
    </Background>
  )
}
