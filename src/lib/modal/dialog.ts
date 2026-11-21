import { router } from "expo-router"
import { openModalRoute } from "./modal-request"

export type DialogOptions = {
  title: string
  message: string
  /** Show a single button (alert) instead of confirm/cancel. */
  isSingleButton?: boolean
  singleButtonText?: string
  successButtonText?: string
  cancelButtonText?: string
  /** Background color of the confirm button. */
  successButtonColor?: string
}

let isLoadingShown = false

/** Shows the full-screen loading animation (`/loading-overlay` modal route). */
export function showLoading() {
  if (isLoadingShown) {
    return
  }
  isLoadingShown = true
  router.push("/loading-overlay")
}

export function hideLoading() {
  if (!isLoadingShown) {
    return
  }
  isLoadingShown = false
  router.back()
}

/** Resolves `true` when the confirm button is pressed. */
export async function confirm(options: DialogOptions): Promise<boolean> {
  hideLoading()
  const result = await openModalRoute<DialogOptions, boolean>(
    "/dialog",
    options,
  )
  return result === true
}

/** Single-button dialog; resolves when dismissed. */
export async function alert(
  options: Omit<DialogOptions, "isSingleButton">,
): Promise<void> {
  hideLoading()
  await openModalRoute<DialogOptions, boolean>("/dialog", {
    singleButtonText: "OK",
    ...options,
    isSingleButton: true,
  })
}

export type RequiredModuleOptions = {
  /** Modules still to be saved, e.g. "OSA and Planogram". */
  requirementNames: string
}

/** "Required Module" card shown when a locked customer module is opened. */
export async function alertRequiredModule(
  options: RequiredModuleOptions,
): Promise<void> {
  hideLoading()
  await openModalRoute<RequiredModuleOptions, void>(
    "/required-module",
    options,
  )
}

export const dialog = { confirm, alert, showLoading, hideLoading }
