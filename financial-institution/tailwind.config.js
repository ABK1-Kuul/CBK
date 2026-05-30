/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#1E3A8A',
        'fin-success': '#16A34A',
        'fin-warning': '#F59E0B',
        'fin-danger': '#DC2626',
        'fin-premium': '#D4AF37',
        'fin-bg-dark': '#0F172A',
        'fin-bg-light': '#F8FAFC',
        'fin-text-primary': '#111827',
        'fin-text-secondary': '#6B7280',
        'fin-text-muted': '#9CA3AF',
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#1e3a8a", // Deep Blue for Trust/Core
          600: "#1e40af",
          700: "#1d4ed8",
          DEFAULT: "#1e3a8a",
        },
        success: {
          500: "#16a34a", // Fintech Green
          DEFAULT: "#16a34a",
        },
        warning: {
          500: "#f59e0b", // Fintech Amber
          DEFAULT: "#f59e0b",
        },
        danger: {
          500: "#dc2626", // Fintech Red
          DEFAULT: "#dc2626",
        },
        goldaccent: {
          500: "#d4af37", // Wealth/Premium Gold
          DEFAULT: "#d4af37",
        },
        slate: {
          950: "#020617",
          900: "#0f172a", // Dark mode base
          850: "#1e293b",
          800: "#1e293b",
          700: "#334155",
          600: "#475569",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
