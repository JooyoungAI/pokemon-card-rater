/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        pokemon: {
          red: '#EE1515',
          gold: '#F0C010',
          blue: '#1E90FF',
          dark: '#111827',
          darker: '#030712'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}
