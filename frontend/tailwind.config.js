/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1", // Indigo 500
        secondary: "#10b981", // Emerald 500
        darkBg: "#0f172a", // Slate 900
        cardBg: "#1e293b", // Slate 800
      }
    },
  },
  plugins: [],
}
