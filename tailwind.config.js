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
        scl: {
          maroon: '#650007',
          darkmaroon: '#3f0004',
          crimson: '#8a0014',
          gold: '#f2ae00',
          lightgold: '#ffd33d',
          sand: '#fff8df',
          cream: '#fffaf0',
          darkbg: '#111827',
          darkcard: '#182234',
        }
      }
    },
  },
  plugins: [],
}
