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
      },
      animation: {
        'scroll-left': 'scroll-left 300s linear infinite',
        'scroll-right': 'scroll-right 300s linear infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
      },
      keyframes: {
        'scroll-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(calc(-50% - 1rem))' },
        },
        'scroll-right': {
          '0%': { transform: 'translateX(calc(-50% - 1rem))' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    }
  },
  plugins: []
}
