import { Href, router, useLocalSearchParams } from "expo-router"
import { useEffect, useRef } from "react"

/**
 * Modal routes can't receive callbacks or JSX through params, so the caller
 * registers a request (options + resolver) and the route gets only its id.
 *
 *   caller:  const result = await openModalRoute("/dialog", { title })
 *   route:   const { options, close } = useModalRequest<Options, Result>()
 *            close(result)  // dismisses the route and resolves the promise
 */
type Request = {
  options: unknown
  resolve: (result: unknown) => void
}

const requests = new Map<string, Request>()
let nextId = 0

export function openModalRoute<TOptions, TResult>(
  pathname: string,
  options: TOptions,
): Promise<TResult | undefined> {
  const id = String(++nextId)
  return new Promise(resolve => {
    requests.set(id, {
      options,
      resolve: result => resolve(result as TResult | undefined),
    })
    router.push({ pathname, params: { requestId: id } } as Href)
  })
}

export function useModalRequest<TOptions, TResult = void>() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>()
  const request = requests.get(requestId)
  const settled = useRef(false)

  function settle(result?: TResult) {
    if (settled.current) {
      return
    }
    settled.current = true
    requests.delete(requestId)
    request?.resolve(result)
  }

  function close(result?: TResult) {
    if (router.canGoBack()) {
      router.back()
    }
    settle(result)
  }

  // Dismissed by gesture / hardware back: resolve with `undefined`.
  useEffect(() => () => settle(), [])

  return {
    options: request?.options as TOptions | undefined,
    close,
  }
}
