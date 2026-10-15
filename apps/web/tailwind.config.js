/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        landing: {
          bg: '#08111F',
          panel: '#101D2E',
          border: '#1E293B',
          muted: '#94A3B8',
          text: '#F8FAFC'
        },
        app: {
          bg: '#F5F7FA',
          surface: '#FFFFFF',
          text: '#15243A',
          muted: '#64748B',
          border: '#DCE3EC'
        },
        primary: {
          DEFAULT: '#2563EB',
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
        },
        secondary: {
          DEFAULT: '#0F766E',
          50: '#F0FDFA',
          100: '#CCFBF1',
          600: '#0D9488',
          700: '#0F766E',
        },
        risk: {
          low: '#15803D',
          medium: '#B45309',
          high: '#C2410C',
          critical: '#B91C1C'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
