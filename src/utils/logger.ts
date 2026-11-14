import { isAxiosError } from "axios"

type Level = "DEBUG" | "INFO" | "WARN" | "ERROR"

/** Longest response body kept in an error log line. */
const MAX_BODY_LENGTH = 500

function timestamp() {
  const now = new Date()
  const pad = (value: number, size = 2) => String(value).padStart(size, "0")
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${pad(now.getMilliseconds(), 3)}`
}

function truncate(text: string) {
  return text.length > MAX_BODY_LENGTH
    ? `${text.slice(0, MAX_BODY_LENGTH)}…`
    : text
}

/**
 * One-line description of a thrown value. For API errors it includes the
 * request (method + url), the HTTP status and the response body.
 */
export function describeError(error: unknown): string {
  if (isAxiosError(error)) {
    const method = error.config?.method?.toUpperCase() ?? "?"
    const url = error.config?.url ?? "?"
    if (!error.response) {
      // Request sent but no answer: offline, timeout, DNS, TLS...
      return `${method} ${url} → no response (${error.code ?? error.message})`
    }
    const body = error.response.data
    const bodyText = typeof body === "string" ? body : JSON.stringify(body)
    return (
      `${method} ${url} → ${error.response.status} ${error.response.statusText ?? ""}`.trim() +
      (bodyText ? ` | ${truncate(bodyText)}` : "")
    )
  }
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`
  }
  return String(error)
}

function write(level: Level, tag: string, message: string, extra?: unknown) {
  const line = `[${timestamp()}] [${level}] [${tag}] ${message}`
  const args = extra === undefined ? [line] : [line, extra]
  switch (level) {
    case "ERROR":
      console.error(...args)
      break
    case "WARN":
      console.warn(...args)
      break
    default:
      console.log(...args)
  }
}

export type Logger = {
  debug: (message: string, extra?: unknown) => void
  info: (message: string, extra?: unknown) => void
  warn: (message: string, extra?: unknown) => void
  /** Logs `message` with the error details (request, status, body or stack). */
  error: (message: string, error?: unknown) => void
}

/** Logger whose lines are prefixed with `tag`, e.g. `createLogger("Sync:OSA")`. */
export function createLogger(tag: string): Logger {
  return {
    debug: (message, extra) => {
      if (__DEV__) write("DEBUG", tag, message, extra)
    },
    info: (message, extra) => write("INFO", tag, message, extra),
    warn: (message, extra) => write("WARN", tag, message, extra),
    error: (message, error) => {
      if (error === undefined) {
        write("ERROR", tag, message)
        return
      }
      write("ERROR", tag, `${message} — ${describeError(error)}`)
      // Full stack only in development builds.
      if (__DEV__ && error instanceof Error && error.stack) {
        console.debug(error.stack)
      }
    },
  }
}
