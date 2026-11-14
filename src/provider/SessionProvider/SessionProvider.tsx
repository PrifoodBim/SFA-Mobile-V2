import { useEffect, useState } from "react"
import { StorageAuthType } from "@/types/auth.type"
import createAppContext from "@/utils/context.utils"
import { isBefore } from "@/utils/date.utils"
import { getDataFromStorage, KEY, removeStorage } from "@/utils/storage.utils"

type SessionStatus = "checking" | "signedIn" | "signedOut"

type SessionContextType = {
  status: SessionStatus
  /** Call once the post-login data load has finished. */
  signIn: () => void
  signOut: () => Promise<void>
}

type Props = {
  children: React.ReactNode
}

const [useSessionContext, SessionContextProvider] =
  createAppContext<SessionContextType>()

function SessionProvider(props: Readonly<Props>) {
  const [status, setStatus] = useState<SessionStatus>("checking")

  useEffect(() => {
    async function checkSession() {
      try {
        const auth = await getDataFromStorage<StorageAuthType>(KEY.AUTHTOKEN)
        setStatus(auth && isBefore(auth.expiryDate) ? "signedIn" : "signedOut")
      } catch (error) {
        console.error("Error checking login status:", error)
        setStatus("signedOut")
      }
    }
    checkSession()
  }, [])

  async function signOut() {
    await removeStorage(KEY.AUTHTOKEN)
    await removeStorage(KEY.USER)
    setStatus("signedOut")
  }

  return (
    <SessionContextProvider
      value={{ status, signIn: () => setStatus("signedIn"), signOut }}
    >
      {props.children}
    </SessionContextProvider>
  )
}

export { SessionProvider, useSessionContext }
