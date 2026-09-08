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
        bebas: ['Rajdhani', '"Bebas Neue"', 'sans-serif'],
        display: ['Rajdhani', '"Bebas Neue"', 'sans-serif'],
        teko: ['Teko', '"Bebas Neue"', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        inter: ['Inter', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Courier New"', 'Courier', 'monospace'],
      },
      backgroundImage: {
        'radial-vignette': 'radial-gradient(circle, rgba(5,5,5,0) 40%, rgba(5,5,5,1) 100%)',
      }
    },
  },
  plugins: [],
}
