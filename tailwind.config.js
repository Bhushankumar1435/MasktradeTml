/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        leat_dark: "#181818",
        light_dark:"#1E1E1E",
        light_white:"#F0F0F0",
      },
    },
  },
  plugins: [],
}