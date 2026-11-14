/**
 * Every navigable path in the app. Use with `router.push(Route.X)`.
 * Paths are file-based (see `src/app`), route groups like `(main)` are omitted.
 */
export const Route = {
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  FORGOT_PASSWORD_CHANGE_PASS: "/forgot-password-change",
  LOADING: "/loading",

  // home tab
  HOME: "/home",
  DASHBOARD: "/home/dashboard",
  PASSWORD: "/home/password",
  DATA_SYNC: "/home/data-sync",
  CAMERA: "/home/camera",

  // customer
  CUSTOMER: "/home/customer",
  CUSTOMER_DASHBOARD: "/home/customer/dashboard",
  CUSTOMER_KPI: "/home/customer/kpi",
  CUSTOMER_PROFILE: "/home/customer/profile",
  CUSTOMER_OSA: "/home/customer/osa",
  CUSTOMER_PLANOGRAM: "/home/customer/planogram",
  CUSTOMER_PLANOGRAM_IMAGE: "/home/customer/planogram-image",
  CUSTOMER_DELIVERY: "/home/customer/delivery",
  CUSTOMER_INVENTORY: "/home/customer/inventory",
  CUSTOMER_MARKET: "/home/customer/market",
  CUSTOMER_NOTES: "/home/customer/notes",
  CUSTOMER_ORDER: "/home/customer/order",
  CUSTOMER_DAR: "/home/customer/dar",

  // admin
  ADMIN: "/home/admin",
  ADMIN_ROUTE_TRACKING: "/home/admin/route-tracking",
  ADMIN_DEMO: "/home/admin/demo",

  // other tabs
  SEARCH: "/search",
  ALERT_DASHBOARD: "/alerts",
  ALERT_DETAILS: "/alerts/details",
} as const

export type RoutePath = (typeof Route)[keyof typeof Route]

/**
 * Header titles: the first word is shown highlighted (e.g. "02.1" in yellow),
 * the rest in white — same as the old `Route` enum suffixes.
 */
export const ROUTE_TITLES: Partial<Record<RoutePath, string>> = {
  [Route.HOME]: "HOME",
  [Route.DASHBOARD]: "01 Dashboard",
  [Route.CUSTOMER]: "CUSTOMER",
  [Route.CUSTOMER_DASHBOARD]: "02 Customer",
  [Route.CUSTOMER_KPI]: "02.0 KPI",
  [Route.CUSTOMER_PROFILE]: "02.1 Profile",
  [Route.CUSTOMER_OSA]: "02.2 OSA",
  [Route.CUSTOMER_PLANOGRAM]: "02.3 Planogram",
  [Route.CUSTOMER_PLANOGRAM_IMAGE]: "02.3 Planogram",
  [Route.CUSTOMER_DELIVERY]: "02.4 Delivery",
  [Route.CUSTOMER_INVENTORY]: "02.5 Inventory",
  [Route.CUSTOMER_MARKET]: "02.6 Market",
  [Route.CUSTOMER_NOTES]: "02.7 Notes",
  [Route.CUSTOMER_ORDER]: "02.8 Order",
  [Route.CUSTOMER_DAR]: "02.9 DAR",
  [Route.PASSWORD]: "03 Password",
  [Route.DATA_SYNC]: "04 Data Sync",
  [Route.ADMIN]: "05 Admin",
  [Route.ADMIN_ROUTE_TRACKING]: "05.1 Route",
  [Route.ADMIN_DEMO]: "05.2 Demo",
  [Route.CAMERA]: "",
  [Route.ALERT_DASHBOARD]: "Alert Messages",
  [Route.ALERT_DETAILS]: "Alert Messages",
}

/** Screens of an open customer visit: leaving them asks to exit the customer. */
export const CUSTOMER_VISIT_ROUTES: RoutePath[] = [
  Route.CUSTOMER_DASHBOARD,
  Route.CUSTOMER_PROFILE,
  Route.CUSTOMER_KPI,
  Route.CUSTOMER_DELIVERY,
  Route.CUSTOMER_INVENTORY,
  Route.CUSTOMER_OSA,
  Route.CUSTOMER_ORDER,
  Route.CUSTOMER_DAR,
  Route.CUSTOMER_MARKET,
  Route.CUSTOMER_PLANOGRAM,
  Route.CUSTOMER_PLANOGRAM_IMAGE,
  Route.CUSTOMER_NOTES,
  Route.CAMERA,
]

/** Screens with unsaved input: going back asks for confirmation. */
export const TRANSACTIONAL_ROUTES: RoutePath[] = [
  Route.CUSTOMER_INVENTORY,
  Route.CUSTOMER_OSA,
  Route.CUSTOMER_ORDER,
  Route.CUSTOMER_DAR,
  Route.CUSTOMER_MARKET,
  Route.CUSTOMER_DELIVERY,
  Route.CUSTOMER_NOTES,
  Route.CUSTOMER_PLANOGRAM,
  Route.CUSTOMER_PLANOGRAM_IMAGE,
]
