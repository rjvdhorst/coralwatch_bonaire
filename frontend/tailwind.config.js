/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          50: '#fff5f5',
          100: '#ffe0e0',
          200: '#ffc7c7',
          300: '#ffa3a3',
          400: '#ff7a7a',
          500: '#ff5252',
          600: '#ff2929',
          700: '#ff0000',
          800: '#cc0000',
          900: '#990000',
        },
      },
    },
  },
  plugins: [],
}