import { ROUTE_TITLES, RoutePath } from "@/constants/routes"
import Headers from "."

/**
 * `screenOptions` for a stack inside a tab: renders the blue header and
 * resolves each screen's title from its path.
 */
export function stackScreenOptions(basePath: string) {
  return ({ route }: { route: { name: string } }) => {
    const path = `${basePath}/${route.name}`.replace(/\/index$/, "")
    return {
      animation: "slide_from_right" as const,
      // Swipe-back would skip the guards in the header's back button.
      gestureEnabled: false,
      title: ROUTE_TITLES[path as RoutePath] ?? "",
      header: () => (
        <Headers path={path} title={ROUTE_TITLES[path as RoutePath]} />
      ),
    }
  }
}
