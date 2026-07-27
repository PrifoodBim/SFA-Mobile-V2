/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        prifoodgray200: "#808080",
        prifoodgray300: "#C8C8C8",
        prifoodgray500: "#6C757D",
        prifoodred600: "#DC3545",
        prifoodgold: "#FFC107",
        prifoodgreen: "#198754",
        prifoodblue100: "#EBF5FF",
        prifoodblue300: "#CFE2FF",
        prifoodblue400: "#0877BD",
        prifoodYellow300: "#FDFFD2",
        prifoodYellow400: "#F9F871",
        prifoodGreen: "#1AAB4F",
      },
    },
  },
  plugins: [],
}
