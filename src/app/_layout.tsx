import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import { useEffect } from "react"
import { BackHandler } from "react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { ThemeProvider } from "styled-components/native"
import { UpdateGate } from "@/components/UpdateGate"
import { theme } from "@/constants/theme"
import { CustomerVisitProvider } from "@/provider/CustomerVisitProvider/CustomerVisitProvider"
import {
  SessionProvider,
  useSessionContext,
} from "@/provider/SessionProvider/SessionProvider"
import { UserProvider } from "@/provider/UserProvider/UserProvider"

SplashScreen.preventAutoHideAsync()

const modalOptions = {
  presentation: "transparentModal",
  animation: "fade",
  gestureEnabled: false,
} as const

function RootNavigator() {
  const { status } = useSessionContext()

  // Device back is disabled: navigation goes through the in-app buttons, which
  // run the guards (unsaved record, incomplete customer visit).
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    )
    return () => subscription.remove()
  }, [])

  useEffect(() => {
    if (status !== "checking") {
      SplashScreen.hideAsync()
    }
  }, [status])

  if (status === "checking") {
    return null
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: false,
      }}
    >
      <Stack.Protected guard={status === "signedOut"}>
        <Stack.Screen name="login" />
        <Stack.Screen
          name="forgot-password"
          options={{ animation: "slide_from_bottom" }}
        />
        <Stack.Screen name="forgot-password-change" />
      </Stack.Protected>

      {/* Post-login data load; signs the session in when done. */}
      <Stack.Screen name="loading" />

      <Stack.Protected guard={status === "signedIn"}>
        <Stack.Screen name="(main)" />
      </Stack.Protected>

      <Stack.Screen name="dialog" options={modalOptions} />
      <Stack.Screen name="required-module" options={modalOptions} />
      <Stack.Screen name="loading-overlay" options={modalOptions} />
      <Stack.Screen name="calendar" options={modalOptions} />
      <Stack.Screen name="sync-progress" options={modalOptions} />
      <Stack.Screen name="inventory-status" options={modalOptions} />
      <Stack.Screen name="market-activity" options={modalOptions} />
      <Stack.Screen
        name="image-preview"
        options={{ ...modalOptions, gestureEnabled: true }}
      />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <StatusBar style="dark" />
        <ThemeProvider theme={theme}>
          <SessionProvider>
            <UserProvider>
              <CustomerVisitProvider>
                <UpdateGate>
                  <RootNavigator />
                </UpdateGate>
              </CustomerVisitProvider>
            </UserProvider>
          </SessionProvider>
        </ThemeProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
