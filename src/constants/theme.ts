export const color = {
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
  green: "#1AAB4F",
  green500: "#198754",
  blue50: "#EBF5FF",
  blue300: "#0DCAF0",
  blue400: "#0877BD",
  yellow300: "#FDFFD2",
  yellow400: "#F2F483",
  red: "#DC3545",
  gold: "#FFC107",
  grey: "#808080",
  grey300: "#C8C8C8",
  grey500: "#6C757D",
} as const

export const fontSize = {
  title: 32,
  subTitle: 24,
  header: 20,
  subheader: 16,
  regular: 14,
  caption: 12,
  small: 10,
} as const

export const theme = { color, fontSize }

export type AppTheme = typeof theme
