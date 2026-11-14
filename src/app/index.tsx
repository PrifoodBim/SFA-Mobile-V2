import { Redirect } from "expo-router"
import { Route } from "@/constants/routes"
import { useSessionContext } from "@/provider/SessionProvider/SessionProvider"

export default function Index() {
  const { status } = useSessionContext()
  return <Redirect href={status === "signedIn" ? Route.HOME : Route.LOGIN} />
}
