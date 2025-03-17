/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/!(node_modules)/**/*.{jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: "class"
};
