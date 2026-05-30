/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: "#020617",
          900: "#0f172a",
          850: "#1e293b", // Custom intermediate color
          800: "#1e293b",
          700: "#334155",
          600: "#475569",
        },
        emerald: {
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        amber: {
          500: "#f59e0b",
          600: "#d97706",
        },
        red: {
          500: "#ef4444",
          600: "#dc2626",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
