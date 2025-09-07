/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'dark-blue': '#1e3a8a',
        'navy': '#1e40af',
        'soft-green': '#17a2b8',  // Updated to match your turquoise owl logo
        'teal': '#20c997',        // Complementary teal green
        'light-gray': '#f8fafc',
        'medium-gray': '#e2e8f0',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}