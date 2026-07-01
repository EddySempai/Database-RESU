/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'umbrella-black': '#050505',
        'blood-red': '#9e0000',
        'neon-red': '#ff2a2a',
      },
      fontFamily: {
        bebas: ['"Bebas Neue"', 'sans-serif'],
        inter: ['Inter', 'Roboto', 'sans-serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      backgroundImage: {
        'radial-vignette': 'radial-gradient(circle, rgba(5,5,5,0) 40%, rgba(5,5,5,1) 100%)',
      }
    },
  },
  plugins: [],
}
