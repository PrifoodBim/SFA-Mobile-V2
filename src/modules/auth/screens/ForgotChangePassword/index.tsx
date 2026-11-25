import useScrollToFocusedInput from "@/hooks/useScrollToFocusedInput"
import { isAxiosError } from "axios"
import { router, useLocalSearchParams } from "expo-router"
import { useState } from "react"
import { KeyboardAvoidingView, ScrollView } from "react-native"
import { Button, PasswordInput, TextInput } from "@/components"
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
import { changeForgotPassword } from "@/services/account.service"

export default function ForgotChangePassword() {
  const keyboardScroll = useScrollToFocusedInput({ align: "nearest" })
  const { email } = useLocalSearchParams<{ email?: string }>()
  const isKeyboardVisible = useKeyboardVisible()
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [code, setCode] = useState<string>("")
  const [passwordError, setPasswordError] = useState<string>("")
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("")
  const [codeError, setCodeError] = useState<string>("")

  function showError(message: string) {
    return alert({ title: "Reset Failed", message, singleButtonText: "Okay" })
  }

  function isDataValid() {
    if (!password) {
      setPasswordError("Password should not be empty")
      return false
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Confirm Password should not be empty")
      return false
    }

    if (password !== confirmPassword) {
      showError("Password do not match")
      return false
    }

    if (!code) {
      setCodeError("Code should not be empty")
      return false
    }

    return true
  }

  async function handleSubmit() {
    try {
      if (!isDataValid() || !email) {
        return
      }
      await changeForgotPassword({
        emailAddress: email,
        password,
        resetCode: code,
      })

      await alert({
        title: "Reset Password",
        message: "Password is successfully change",
        singleButtonText: "Okay",
      })
      router.dismissTo(Route.LOGIN)
    } catch (error) {
      const message =
        (isAxiosError(error) && error.response?.data?.error?.message) ||
        "Something went wrong"
      showError(message)
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
            <Title>Reset Password</Title>
            <Subtitle>Enter your new password.</Subtitle>
            <Fields $gap={20}>
              <PasswordInput
                labelStyle={authLabelStyle}
                label="New Password"
                value={password}
                errorText={passwordError}
                onChangeText={setPassword}
              />
              <PasswordInput
                labelStyle={authLabelStyle}
                label="Confirm Password"
                value={confirmPassword}
                errorText={confirmPasswordError}
                onChangeText={setConfirmPassword}
              />
              <TextInput
                labelStyle={authLabelStyle}
                label="Reset Code"
                value={code}
                errorText={codeError}
                onChangeText={setCode}
              />
            </Fields>
            <Button
              title="Reset"
              width={100}
              buttonStyle={{ marginTop: 20, alignSelf: "center" }}
              onPress={handleSubmit}
            />
            <LinkButton onPress={() => router.back()}>
              <LinkText>Back</LinkText>
            </LinkButton>
          </Content>
        </ScrollView>
      </KeyboardAvoidingView>
      {!isKeyboardVisible && (
        <AuthFooter buildColor={color.gold} isSpaced={false} />
      )}
    </Background>
  )
}
