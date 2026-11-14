import NetInfo from "@react-native-community/netinfo"
import LottieView from "lottie-react-native"
import { useEffect, useRef, useState } from "react"
import { BackHandler } from "react-native"
import styled from "styled-components/native"
import Button from "@/components/Button"
import { LOTTIE } from "@/constants/images"
import { alert, useModalRequest } from "@/lib/modal"
import {
  alertImage,
  syncAlertToServer,
} from "@/modules/alerts/controllers/alert.controller"
import { syncKpiData } from "@/modules/customer/controllers/customerkpi.controller"
import { syncCustomerNotesToServer } from "@/modules/customer/controllers/customerNotes.controller"
import {
  handleInventoryStatusOption,
  handlePlanogramGroupsOption,
} from "@/modules/customer/controllers/customerOption.controller"
import { syncCsRecordToServer } from "@/modules/customer/controllers/customerOrder.controller"
import {
  syncDarInfoFromServer,
  syncDarUploadToServer,
} from "@/modules/customer/controllers/darInfo.controller"
import { syncDeliveryToServer } from "@/modules/customer/controllers/delivery.controller"
import { syncInventoryToServer } from "@/modules/customer/controllers/inventory.controller"
import { syncOsaToServer } from "@/modules/customer/controllers/osa.controller"
import {
  syncPlanogramDataFromServer,
  syncPlanogramRecordToServer,
} from "@/modules/customer/controllers/planogramRecord.controller"
import { syncDashboardToServer } from "@/modules/dashboard/controllers/dashboard.controller"
import { useUserContext } from "@/provider/UserProvider/UserProvider"
import { KEY, saveStorage } from "@/utils/storage.utils"
import { createLogger } from "@/utils/logger"
import {
  fetchDemo,
  getCustomer,
  getMapsettings,
  getMcp,
  getProductList,
  handleGetUserInfo,
  handleOptionDemoGroup,
  handleOptionMarketTypes,
  handleUploadMarketAnalysis,
  imageCustomer,
  productImage,
  productPartnerList,
  sendAndGetMcpLogs,
} from "../../services/sync.service"

type SyncContext = {
  setError: (error: string) => void
  setUserData: (user: unknown) => void
}

type SyncStep = {
  /** Shown in the sync logs. */
  name: string
  run: (context: SyncContext) => Promise<unknown>
}

/** Every sync cycle, run in order. */
const SYNC_STEPS: SyncStep[] = [
  {
    name: "User info",
    run: async ({ setError, setUserData }) => {
      const user = await handleGetUserInfo(setError)
      if (user) {
        await saveStorage(KEY.USER, user)
        setUserData(user)
      }
    },
  },
  { name: "Dashboard", run: ({ setError }) => syncDashboardToServer(setError) },
  { name: "Customer KPI", run: ({ setError }) => syncKpiData(setError) },
  { name: "DAR info", run: ({ setError }) => syncDarInfoFromServer(setError) },
  {
    name: "DAR upload",
    run: ({ setError }) => syncDarUploadToServer(setError),
  },
  { name: "MCP logs", run: ({ setError }) => sendAndGetMcpLogs(setError) },
  { name: "MCP coverage", run: ({ setError }) => getMcp(setError) },
  { name: "Customers", run: ({ setError }) => getCustomer(setError) },
  {
    name: "Product partners",
    run: ({ setError }) => productPartnerList(setError),
  },
  { name: "Products", run: ({ setError }) => getProductList(setError) },
  {
    name: "Inventory upload",
    run: ({ setError }) => syncInventoryToServer(setError),
  },
  {
    name: "Planogram upload",
    run: ({ setError }) => syncPlanogramRecordToServer(setError),
  },
  { name: "OSA upload", run: ({ setError }) => syncOsaToServer(setError) },
  {
    name: "Delivery upload",
    run: ({ setError }) => syncDeliveryToServer(setError),
  },
  {
    name: "Suggested order upload",
    run: ({ setError }) => syncCsRecordToServer(setError),
  },
  {
    name: "Market analysis upload",
    run: ({ setError }) => handleUploadMarketAnalysis(setError),
  },
  {
    name: "Demo group options",
    run: ({ setError }) => handleOptionDemoGroup(setError),
  },
  {
    name: "Market type options",
    run: ({ setError }) => handleOptionMarketTypes(setError),
  },
  {
    name: "Customer notes upload",
    run: ({ setError }) => syncCustomerNotesToServer(setError),
  },
  {
    name: "Inventory status options",
    run: ({ setError }) => handleInventoryStatusOption(setError),
  },
  {
    name: "Planogram group options",
    run: ({ setError }) => handlePlanogramGroupsOption(setError),
  },
  { name: "Customer images", run: ({ setError }) => imageCustomer(setError) },
  { name: "Product images", run: ({ setError }) => productImage(setError) },
  { name: "Alerts", run: ({ setError }) => syncAlertToServer(setError) },
  { name: "Alert images", run: ({ setError }) => alertImage(setError) },
  {
    name: "Planogram data",
    run: ({ setError }) => syncPlanogramDataFromServer(setError),
  },
  { name: "Demo", run: ({ setError }) => fetchDemo(setError) },
  { name: "Map settings", run: ({ setError }) => getMapsettings(setError) },
]

const TOTAL_STEPS = SYNC_STEPS.length

const log = createLogger("Sync")

const Backdrop = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
`

const Wrapper = styled.View`
  width: 90%;
  height: 40%;
  padding: 12px;
`

const Card = styled.View`
  flex: 1;
  background-color: ${props => props.theme.color.white};
  border-radius: 6px;
  padding: 12px;
`

const Title = styled.Text`
  font-size: 18px;
  font-weight: bold;
  text-align: center;
`

const Message = styled.Text`
  text-align: center;
  margin: 8px 0;
`

const ProgressTrack = styled.View`
  width: 75%;
  height: 6px;
  align-self: center;
  border-width: 1px;
  border-color: ${props => props.theme.color.blue400};
  border-radius: 4px;
  overflow: hidden;
`

const ProgressFill = styled.View<{ $progress: number }>`
  width: ${props => Math.min(props.$progress, 1) * 100}%;
  height: 100%;
  background-color: ${props => props.theme.color.blue400};
`

const Cycle = styled.Text`
  margin-top: 12px;
  color: ${props => props.theme.color.black};
  text-align: center;
`

const Hint = styled.Text`
  font-size: 12px;
  text-align: center;
  margin-top: 8px;
`

/** Modal route `/sync-progress`: runs the full sync and resolves with the failed step messages. */
export default function SyncProgress() {
  const { close } = useModalRequest<undefined, string[]>()
  const { setUserData } = useUserContext()
  const [count, setCount] = useState(0)
  const [errors, setErrors] = useState<string[]>([])
  const [isDone, setIsDone] = useState(false)
  const isOfflineAlertShown = useRef(false)

  // The sync can't be cancelled midway: block the hardware back button.
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    )
    return () => subscription.remove()
  }, [])

  useEffect(() => {
    const context: SyncContext = {
      setError: error => setErrors(prev => [...prev, error]),
      setUserData,
    }

    async function handleNetworkIssue() {
      const state = await NetInfo.refresh()
      if (!state.isConnected) {
        log.warn(`Device is offline (${state.type})`)
      }
      if (!state.isConnected && !isOfflineAlertShown.current) {
        isOfflineAlertShown.current = true
        await alert({
          title: "Sync Failed",
          message:
            "No internet connection. Please check your connection and try again.",
          singleButtonText: "Continue",
        })
      }
    }

    async function syncData() {
      const syncStart = Date.now()
      const failedSteps: string[] = []
      log.info(`Sync started (${TOTAL_STEPS} steps)`)

      for (const [index, step] of SYNC_STEPS.entries()) {
        handleNetworkIssue()
        setCount(prev => prev + 1)

        const label = `${index + 1}/${TOTAL_STEPS} ${step.name}`
        const stepStart = Date.now()
        let stepErrors = 0
        const stepContext: SyncContext = {
          ...context,
          setError: error => {
            stepErrors++
            log.warn(`${label} reported: ${error}`)
            context.setError(error)
          },
        }

        log.info(`${label} started`)
        try {
          await step.run(stepContext)
        } catch (error) {
          // Steps catch their own errors; anything reaching here is unexpected.
          stepErrors++
          log.error(`${label} threw`, error)
          context.setError(`${step.name} not sync`)
        }

        const duration = Date.now() - stepStart
        if (stepErrors > 0) {
          failedSteps.push(step.name)
          log.warn(`${label} finished with errors in ${duration}ms`)
        } else {
          log.info(`${label} done in ${duration}ms`)
        }
      }

      const totalDuration = ((Date.now() - syncStart) / 1000).toFixed(1)
      if (failedSteps.length > 0) {
        log.warn(
          `Sync finished in ${totalDuration}s, ${failedSteps.length}/${TOTAL_STEPS} steps failed: ${failedSteps.join(", ")}`,
        )
      } else {
        log.info(`Sync finished in ${totalDuration}s, all steps succeeded`)
      }
      doneTimer = setTimeout(() => setIsDone(true), 5000)
    }

    let doneTimer: ReturnType<typeof setTimeout> | undefined
    const startTimer = setTimeout(syncData, 2000)

    return () => {
      clearTimeout(startTimer)
      clearTimeout(doneTimer)
    }
    // Runs once when the modal opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isDone) {
    const message =
      errors.length > 0
        ? `Your ${TOTAL_STEPS - errors.length} out of ${TOTAL_STEPS} data has been successfully synced! Thank you for patience!`
        : "Your data has been successfully synced! Thank you for your patience!"

    return (
      <Backdrop>
        <Wrapper>
          <Card>
            <Title>Data Sync Complete</Title>
            <LottieView
              source={LOTTIE.done}
              autoPlay
              loop={false}
              style={{ flex: 1 }}
            />
            <Message>{message}</Message>
            <Button
              title="Continue"
              buttonColor="tertiary"
              width={150}
              buttonStyle={{ alignSelf: "center" }}
              onPress={() => close(errors)}
            />
          </Card>
        </Wrapper>
      </Backdrop>
    )
  }

  return (
    <Backdrop>
      <Wrapper>
        <Card>
          <LottieView
            source={LOTTIE.upload}
            autoPlay
            loop
            style={{ flex: 1 }}
          />
          <ProgressTrack>
            <ProgressFill $progress={count / TOTAL_STEPS} />
          </ProgressTrack>
          <Cycle>
            Synchronizing {count} of {TOTAL_STEPS} Cycle
          </Cycle>
          <Hint>This may take a while, please wait</Hint>
        </Card>
      </Wrapper>
    </Backdrop>
  )
}
