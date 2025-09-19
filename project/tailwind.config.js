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
        // Primary (Deep Blue)
        'cyber-grape': '#0077B6',
        // Accent (Bright Yellow)
        'persimmon': '#FFB703',
        // Secondary / Background (Soft Sky Blue)
        'isabelline': '#90E0EF',
        // Text (Almost Black)
        'dark-gunmetal': '#1A1A1A',
        // Success/Progress (kept as is)
        'caribbean-green': '#00CC99',
        // Additional variations / shades
        'cyber-grape-light': '#2CA0DC',
        'cyber-grape-dark': '#005A87',
        'persimmon-light': '#FFD166',
        'persimmon-dark': '#E6A100',
        'caribbean-green-light': '#33DDB3',
        'caribbean-green-dark': '#00A67A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
