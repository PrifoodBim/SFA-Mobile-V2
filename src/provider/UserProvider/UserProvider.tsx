import { useState } from "react"
import createAppContext from "@/utils/context.utils"

type UserContextType = {
  userId: string
  setUserId: (userId: string) => void
  userData: any
  setUserData: (userData: any) => void
}

type Props = {
  children: React.ReactNode
}

const [useUserContext, UserContextProvider] =
  createAppContext<UserContextType>()

function UserProvider(props: Readonly<Props>) {
  const [userId, setUserId] = useState<string>("")
  const [userData, setUserData] = useState<any>(undefined)

  return (
    <UserContextProvider value={{ userId, setUserId, userData, setUserData }}>
      {props.children}
    </UserContextProvider>
  )
}

export { UserProvider, useUserContext }
