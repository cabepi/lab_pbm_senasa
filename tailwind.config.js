/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        senasa: {
          primary: "#009640", // Official Green
          secondary: "#8BC53F", // Light Green
          dark: "#007A33", // Darker shade for hover
          light: "#F0F9F4", // Very light background
        }
      }
    },
  },
  plugins: [],
}
