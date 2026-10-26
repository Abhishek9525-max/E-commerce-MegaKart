/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "rabbit-red": "#A94F38",
        gray: {
          50: "#FAF8F5",
          100: "#F0EDE7",
          200: "#D8D2C8",
          300: "#C8C1B6",
          400: "#A7A197",
          500: "#77746D",
          600: "#77746D",
          700: "#5C5A54",
          800: "#33342E",
          900: "#171714",
        },
        indigo: {
          50: "#F1F2EF",
          100: "#E5E8E1",
          200: "#CDD3C6",
          300: "#AAB49F",
          400: "#879479",
          500: "#68765A",
          600: "#414B36",
          700: "#414B36",
          800: "#30392A",
          900: "#171714",
        },
        pink: {
          50: "#EEEAE2",
          100: "#F0EDE7",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
      },
    },
  },
  plugins: [],
}