import { openModalRoute } from "@/lib/modal"
import { CalendarOptions } from "./types"

export type { CalendarOptions } from "./types"

/** Opens the `/calendar` modal; resolves the picked date, or `undefined` on cancel. */
export function pickDate(options: CalendarOptions) {
  return openModalRoute<CalendarOptions, Date>("/calendar", options)
}
