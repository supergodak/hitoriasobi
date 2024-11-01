/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#EF4444', // red-600
        'secondary': '#1F2937', // gray-800
      },
    },
  },
  plugins: [],
};