import { router } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Text } from "react-native"
import styled from "styled-components/native"
import { baseURL } from "@/config/api"
import { Route } from "@/constants/routes"
import { color } from "@/constants/theme"
import { createId, findOne, insert, write } from "@/db"
import { Coverage, CoverageModel } from "@/db/models/Coverage.model"
import { alert } from "@/lib/modal"
import { removeSystemGeneratedCoverage } from "@/modules/sync/services/sync.service"
import { useSessionContext } from "@/provider/SessionProvider/SessionProvider"
import { useUserContext } from "@/provider/UserProvider/UserProvider"
import { getUser } from "@/services/account.service"
import { getCoverageList } from "@/services/coverage.service"
import { downloadImage } from "@/utils/image.utils"
import { getPermission } from "@/utils/permission.utils"
import { getDataFromStorage, KEY, saveStorage } from "@/utils/storage.utils"

/** Coverage as returned by the server. */
type CoverageResponse = Omit<Coverage, "_id" | "coverageDate"> & {
  coverageDate: string
  visited: boolean
}

const Wrapper = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

/** Post-login data load: user info + today's coverage, then signs the session in. */
export default function Loading() {
  const { status, signIn } = useSessionContext()
  const { setUserId, setUserData } = useUserContext()
  const [isUserSet, setIsUserSet] = useState<boolean>(false)
  const [isCoverageSet, setIsCoverageSet] = useState<boolean>(false)

  async function getUserCoverage() {
    try {
      const resp = await getCoverageList()

      write(() => {
        resp.items.forEach((element: CoverageResponse) => {
          if (
            findOne(CoverageModel, {
              where: { coverageId: element.coverageId },
            })
          ) {
            return
          }
          const isSystemGeneratedVisited =
            removeSystemGeneratedCoverage(element)
          insert(CoverageModel, {
            _id: createId(),
            coverageId: element.coverageId,
            coverageDate: new Date(element.coverageDate),
            userName: element.userName,
            empId: element.empId,
            empName: element.empName,
            position: element.position,
            customerCode: element.customerCode,
            customerName: element.customerName,
            priority: element.priority,
            planned: element.planned,
            status: element.status,
            isVisited:
              element.visited === true || isSystemGeneratedVisited ? 1 : 0,
            updatedBy: element.empId,
            updatedDate: new Date(),
            createBy: element.empId,
            createDate: new Date(),
          })
        })
      })
      setIsCoverageSet(true)
    } catch (error) {
      console.error("error", error)
    }
  }

  async function getUserInfo() {
    try {
      const storedData = await getDataFromStorage(KEY.USER)
      if (storedData) {
        setUserId(storedData.empId)
        setUserData(storedData)
        setIsUserSet(true)
        return
      }

      const resp = await getUser()
      if (!resp) {
        router.replace(Route.LOGIN)
        return
      }

      if (!getPermission(resp.grantedPermissions, "Mobile")) {
        await alert({
          title: "Permission Restriction",
          message: "You dont have access to this application",
          singleButtonText: "Continue",
        })
        router.replace(Route.LOGIN)
        return
      }

      await downloadImage(
        baseURL + "accounts/profile-image",
        (resp.empId as string) + ".png",
      )
      setUserId(resp.empId as string)
      await saveStorage(KEY.USER, resp)
      await saveStorage(KEY.USER_ID, resp.empId as string)
      setUserData(resp)
      setIsUserSet(true)
    } catch (error) {
      console.error(error)
      router.replace(Route.LOGIN)
    }
  }

  useEffect(() => {
    getUserInfo()
    getUserCoverage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isUserSet && isCoverageSet) {
      signIn()
    }
  }, [isUserSet, isCoverageSet, signIn])

  useEffect(() => {
    if (status === "signedIn") {
      router.replace(Route.HOME)
    }
  }, [status])

  return (
    <Wrapper>
      <ActivityIndicator size="large" color={color.blue400} />
      <Text>Please wait....</Text>
    </Wrapper>
  )
}
