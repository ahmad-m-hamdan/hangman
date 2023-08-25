/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ["./src/**/*.html", "./src/**/*.jsx", "./src/**/*.js"],
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
    fontFamily: {
      primary: ["cursive", "sans"],
    },
  },
  plugins: [],
};
