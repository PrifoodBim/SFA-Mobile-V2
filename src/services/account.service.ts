import api from "@/config/api"

export const getUser = async () => {
  const resp = await api.get("accounts/profile")

  return resp.data
}

export const sendEmailForgotPassword = async (email: string) => {
  const resp = await api.post("accounts/password/forgot", {
    emailAddress: email,
  })

  return resp
}

export const changeForgotPassword = async (payload: {
  emailAddress: string
  password: string
  resetCode: string
}) => {
  const resp = await api.post("accounts/password/reset", payload)

  return resp
}

export const changePassword = async (payload: {
  currentPassword: string
  newPassword: string
}) => {
  const resp = await api.post("accounts/password/change", payload)

  return resp
}
