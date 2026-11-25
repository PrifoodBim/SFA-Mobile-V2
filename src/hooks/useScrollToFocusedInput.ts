import { useEffect, useRef, useState } from "react"
import {
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  TextInput,
} from "react-native"

/**
 * Scrolls a form's ScrollView so the focused field is centered in the space
 * between the top of the ScrollView and the keyboard.
 *
 * Use inside a `KeyboardAvoidingView` (behavior "padding"): that view shrinks
 * the screen above the keyboard so there is room to scroll. Spread the returned
 * props onto the ScrollView (it sets `contentContainerStyle`).
 */
export default function useScrollToFocusedInput() {
  const scrollRef = useRef<ScrollView>(null)
  const scrollOffset = useRef(0)
  // Extra space under the form while the keyboard is open, so fields near the
  // end can still scroll up to the center.
  const [bottomSpace, setBottomSpace] = useState(0)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const subscription = Keyboard.addListener("keyboardDidShow", event => {
      const keyboardTop = event.endCoordinates.screenY
      setBottomSpace(event.endCoordinates.height / 2)
      // Let KeyboardAvoidingView apply its padding first, so there is room to scroll.
      timer = setTimeout(() => {
        const input = TextInput.State.currentlyFocusedInput()
        const scroll = scrollRef.current
        const scrollHost = scroll?.getNativeScrollRef()
        if (!input || !scroll || !scrollHost) return
        scrollHost.measureInWindow((_sx, scrollTop) => {
          input.measureInWindow((_x, y, _width, height) => {
            const visibleCenter = (scrollTop + keyboardTop) / 2
            const delta = y + height / 2 - visibleCenter
            scroll.scrollTo({
              y: Math.max(0, scrollOffset.current + delta),
              animated: true,
            })
          })
        })
      }, 100)
    })
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () =>
      setBottomSpace(0),
    )
    return () => {
      clearTimeout(timer)
      subscription.remove()
      hideSubscription.remove()
    }
  }, [])

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    scrollOffset.current = event.nativeEvent.contentOffset.y
  }

  return {
    ref: scrollRef,
    onScroll,
    scrollEventThrottle: 16,
    contentContainerStyle: { paddingBottom: bottomSpace },
    keyboardShouldPersistTaps: "handled" as const,
  }
}
