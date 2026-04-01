/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 32px -12px rgba(15, 23, 42, 0.09), 0 2px 8px -4px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
}