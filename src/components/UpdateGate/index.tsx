import * as Updates from "expo-updates"
import LottieView from "lottie-react-native"
import { ReactNode, useEffect, useState } from "react"
import { StyleSheet } from "react-native"
import styled from "styled-components/native"
import { LOTTIE } from "@/constants/images"
import { color } from "@/constants/theme"
import { createLogger } from "@/utils/logger"

const log = createLogger("OTA")

type Phase = "idle" | "downloading" | "restarting"

const Backdrop = styled.View`
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
`

const Card = styled.View`
  width: 80%;
  align-items: center;
  padding: 24px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.color.white};
`

const Title = styled.Text`
  margin-top: 8px;
  font-size: ${({ theme }) => theme.fontSize.subheader}px;
  font-weight: bold;
  color: ${({ theme }) => theme.color.black};
`

const Message = styled.Text`
  margin-top: 4px;
  text-align: center;
  font-size: ${({ theme }) => theme.fontSize.regular}px;
  color: ${({ theme }) => theme.color.grey500};
`

const ProgressTrack = styled.View`
  width: 100%;
  height: 6px;
  margin-top: 16px;
  border-radius: 3px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.color.grey300};
`

const ProgressFill = styled.View<{ percent: number }>`
  width: ${({ percent }) => percent}%;
  height: 100%;
  background-color: ${({ theme }) => theme.color.blue400};
`

/**
 * Checks EAS Update when the app starts. When an update is published for this
 * build's channel it covers the app with a blocking loading card while the
 * update downloads, then restarts into it.
 */
export function UpdateGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("idle")
  const { downloadProgress } = Updates.useUpdates()

  useEffect(() => {
    // Updates are disabled in development and Expo Go.
    if (__DEV__ || !Updates.isEnabled) {
      return
    }

    let cancelled = false

    const run = async () => {
      try {
        const check = await Updates.checkForUpdateAsync()
        if (!check.isAvailable || cancelled) {
          log.info(`Up to date (update ${Updates.updateId ?? "embedded"})`)
          return
        }

        log.info("Update found, downloading")
        setPhase("downloading")
        const fetched = await Updates.fetchUpdateAsync()
        if (!fetched.isNew) {
          setPhase("idle")
          return
        }

        log.info("Update downloaded, restarting")
        setPhase("restarting")
        await Updates.reloadAsync({
          reloadScreenOptions: {
            backgroundColor: color.white,
            spinner: { enabled: true, color: color.blue400, size: "large" },
            fade: true,
          },
        })
      } catch (error) {
        // Offline or server error: keep running the current version.
        log.warn("Update check/download failed", error)
        if (!cancelled) setPhase("idle")
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  const percent = Math.round((downloadProgress ?? 0) * 100)

  return (
    <>
      {children}
      {phase !== "idle" && (
        <Backdrop style={StyleSheet.absoluteFill}>
          <Card>
            <LottieView
              source={LOTTIE.loading}
              autoPlay
              loop
              style={{ width: 80, height: 80 }}
            />
            <Title>
              {phase === "downloading" ? "Updating App" : "Restarting"}
            </Title>
            <Message>
              {phase === "downloading"
                ? `Downloading the latest version… ${percent}%`
                : "Applying the update, please wait."}
            </Message>
            {phase === "downloading" && (
              <ProgressTrack>
                <ProgressFill percent={percent} />
              </ProgressTrack>
            )}
          </Card>
        </Backdrop>
      )}
    </>
  )
}
