/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ["./src/**/*.html", "./src/**/*.jsx", "./src/**/*.js"],
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
    fontFamily: {
      primary: ["'Press Start 2P'", "cursive"],
    },
  },
  plugins: [],
};
