import { router } from "expo-router"
import styled from "styled-components/native"
import { Route, RoutePath, TRANSACTIONAL_ROUTES } from "@/constants/routes"
import { color } from "@/constants/theme"
import { confirm } from "@/lib/modal"
import { exitCustomerVisit } from "@/modules/customer/handlers/customerVisit"
import { MaterialIcon } from "@/types/icon.enum"
import { dateFormat } from "@/utils/date.utils"
import Icon from "../Icon"

type Props = {
  /** Path of the screen this header belongs to. */
  path: string
  title?: string
}

const Bar = styled.View`
  width: 100%;
  height: 50px;
  flex-direction: row;
  align-items: center;
  background-color: ${props => props.theme.color.blue400};
`

const Side = styled.View`
  width: 40px;
`

const BackButton = styled.TouchableOpacity`
  width: 40px;
  justify-content: center;
  align-items: center;
`

const Center = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const Highlight = styled.Text`
  font-weight: 600;
  color: ${props => props.theme.color.yellow400};
`

const Plain = styled.Text`
  font-weight: 600;
  color: ${props => props.theme.color.white};
`

/** Blue stack header: "<number> <TITLE>" with a guarded back button. */
export default function Headers(props: Readonly<Props>) {
  const { title = "" } = props
  const pathname = props.path as RoutePath

  async function handleBack() {
    if (pathname === Route.CUSTOMER_DASHBOARD) {
      if (!(await exitCustomerVisit())) return
    } else if (TRANSACTIONAL_ROUTES.includes(pathname)) {
      const isExit = await confirm({
        title: "Record Not Save",
        message:
          "You have unsaved changes. Are you sure you want to exit without saving?",
        successButtonColor: color.red,
      })
      if (!isExit) return
    }
    router.back()
  }

  function renderTitle() {
    const upperTitle = title.toUpperCase()
    if (pathname === Route.CUSTOMER) {
      return (
        <Highlight>
          <Plain>{dateFormat(new Date(), "MM-DD-YYYY")} | </Plain>
          {dateFormat(new Date(), "dddd").toUpperCase()}
        </Highlight>
      )
    }
    const [first, ...rest] = upperTitle.split(" ")
    return (
      <Highlight>
        {first} <Plain>{rest.join(" ")}</Plain>
      </Highlight>
    )
  }

  const canGoBack = pathname !== Route.HOME

  return (
    <Bar>
      {canGoBack ? (
        <BackButton onPress={handleBack}>
          <Icon name={MaterialIcon.BACK} size={16} />
        </BackButton>
      ) : (
        <Side />
      )}
      <Center>{renderTitle()}</Center>
      <Side />
    </Bar>
  )
}
