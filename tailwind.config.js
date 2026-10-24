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
        forest: {
          50: '#f0fdf6',
          100: '#dbfce9',
          200: '#baf8d5',
          300: '#87f0b7',
          400: '#4cdb92',
          500: '#23bf73',
          600: '#169d5c',
          700: '#147c4b',
          800: '#14623d',
          900: '#135034',
          950: '#062d1c',
        },
        dukaan: {
          bg: '#F8F9F6',
          card: '#FFFFFF',
          border: '#E8EBE4',
          text: '#1C2520',
          muted: '#617268',
          accent: '#0D4730',
          accentHover: '#093624',
          gold: '#C59A45',
          goldLight: '#FDF6E9',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(16, 24, 40, 0.05), 0 1px 2px 0 rgba(16, 24, 40, 0.03)',
        'card': '0 4px 14px 0 rgba(15, 56, 42, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
        'elevated': '0 10px 30px -4px rgba(15, 56, 42, 0.08), 0 4px 10px -2px rgba(15, 56, 42, 0.03)',
      }
    },
  },
  plugins: [],
}
