import { useState } from "react"

export default function useValidateInput() {
  const [email, setEmailValue] = useState<string>("")
  const [password, setPasswordValue] = useState<string>("")
  const [emailError, setEmailError] = useState<string>("")
  const [passwordError, setPasswordError] = useState<string>("")

  function setEmail(value: string) {
    setEmailValue(value)
    setEmailError("")
  }

  function setPassword(value: string) {
    setPasswordValue(value)
    setPasswordError("")
  }

  function isValidData() {
    if (!email) {
      setEmailError("User ID is required")
      return false
    }
    if (!password) {
      setPasswordError("Password is required")
      return false
    }
    return true
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    emailError,
    passwordError,
    isValidData,
  }
}
