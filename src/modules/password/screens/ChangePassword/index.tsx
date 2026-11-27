import { useHeaderHeight } from "expo-router/react-navigation"
import useScrollToFocusedInput from "@/hooks/useScrollToFocusedInput"
import NetInfo from "@react-native-community/netinfo"
import { isAxiosError } from "axios"
import { router } from "expo-router"
import { useState } from "react"
import {
  KeyboardAvoidingView,
  ScrollView,
  useWindowDimensions,
} from "react-native"
import styled from "styled-components/native"
import { Button, Container, PasswordInput, UserCard } from "@/components"
import { color, spacing } from "@/constants/theme"
import { alert } from "@/lib/modal"
import { changePassword } from "@/services/account.service"

const Actions = styled.View`
  flex-direction: row;
  justify-content: space-evenly;
  margin: 12px 0;
`

const Title = styled.Text`
  text-align: center;
  margin-top: 8px;
  font-size: 18px;
`

const Fields = styled.View`
  gap: 8px;
  margin-top: 12px;
  width: 100%;
`

const labelStyle = { color: color.black }

const BUTTON_WIDTH = 150

/**
 * Side inset that lines the fields up with the outer edges of the SAVE and
 * CANCEL buttons (two fixed-width buttons spaced evenly across the row).
 */
function useButtonRowInset() {
  const { width } = useWindowDimensions()
  const rowWidth = width - spacing.screen * 2
  return Math.max(0, (rowWidth - BUTTON_WIDTH * 2) / 3)
}

export default function ChangePassword() {
  const fieldsInset = useButtonRowInset()
  const headerHeight = useHeaderHeight()
  const keyboardScroll = useScrollToFocusedInput({ align: "nearest" })
  const [currentPassword, setCurrentPassword] = useState<string>("")
  const [newPassword, setNewPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [currentPasswordError, setCurrentPasswordError] = useState<string>("")
  const [newPasswordError, setNewPasswordError] = useState<string>("")
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("")

  function handleChange(setValue: (value: string) => void) {
    return (value: string) => {
      setValue(value)
      setCurrentPasswordError("")
      setNewPasswordError("")
      setConfirmPasswordError("")
    }
  }

  function handleNetworkIssue() {
    NetInfo.refresh().then(state => {
      if (!state.isConnected) {
        alert({
          title: "Change Password Failed",
          message:
            "No internet connection. Please check your connection and try again.",
          singleButtonText: "Continue",
        })
      }
    })
  }

  async function handleSubmit() {
    try {
      handleNetworkIssue()
      if (!currentPassword) {
        setCurrentPasswordError("Current Password is required")
        return
      }

      if (!newPassword) {
        setNewPasswordError("New Password is required")
        return
      }

      if (newPassword !== confirmPassword) {
        setConfirmPasswordError("Password do not match")
        return
      }

      const resp = await changePassword({ currentPassword, newPassword })

      if (resp) {
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        alert({
          title: "Change Password",
          message: "Password succesfully change",
          singleButtonText: "OK",
        })
      }
    } catch (error) {
      const data = isAxiosError(error) ? error.response?.data : undefined
      alert({
        title: "Change Password Failed",
        message: data ? String(data) : "Something went wrong",
        singleButtonText: "OK",
        successButtonColor: color.blue400,
      })
    }
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={headerHeight}
      style={{ flex: 1 }}
    >
      <Container>
        <UserCard />
        <Actions>
          <Button
            title="SAVE"
            buttonColor="primary"
            width={BUTTON_WIDTH}
            onPress={handleSubmit}
          />
          <Button
            title="CANCEL"
            buttonColor="danger"
            width={BUTTON_WIDTH}
            onPress={() => router.back()}
          />
        </Actions>
        <ScrollView {...keyboardScroll}>
          <Title>Change Password</Title>
          <Fields style={{ paddingHorizontal: fieldsInset }}>
            <PasswordInput
              label="Current Password"
              labelStyle={labelStyle}
              value={currentPassword}
              onChangeText={handleChange(setCurrentPassword)}
              errorText={currentPasswordError}
            />
            <PasswordInput
              label="New Password"
              labelStyle={labelStyle}
              value={newPassword}
              onChangeText={handleChange(setNewPassword)}
              errorText={newPasswordError}
            />
            <PasswordInput
              label="Confirm Password"
              labelStyle={labelStyle}
              value={confirmPassword}
              onChangeText={handleChange(setConfirmPassword)}
              errorText={confirmPasswordError}
            />
          </Fields>
        </ScrollView>
      </Container>
    </KeyboardAvoidingView>
  )
}
