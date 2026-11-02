/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        hospital: {
          teal: '#0d9488',
          blue: '#0284c7',
          dark: '#0f172a',
          light: '#f8fafc',
          card: '#ffffff',
          accent: '#3b82f6',
        }
      }
    },
  },
  plugins: [],
}
