/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.tsx",
    "./src/**/*.ts",
    "./src/**/*.jsx",
    "./src/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'galaxy-blue': '#0066CC',
        'galaxy-dark': '#001F3F',
        'galaxy-light': '#E6F2FF',
      }
    },
  },
  plugins: [],
}