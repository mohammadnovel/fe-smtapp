/** @type {import('tailwindcss').Config} */
// Gray steps come from CSS variables so the dark theme can swap them (see main.css)
const gray = Object.fromEntries(
  [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(n => [n, `rgb(var(--g-${n}) / <alpha-value>)`])
)

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gray,
        primary: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        sport: {
          excellent:     '#1D9E75',
          good:          '#3B82F6',
          average:       '#F59E0B',
          'below-avg':   '#F97316',
          poor:          '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
