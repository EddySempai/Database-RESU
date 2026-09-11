/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        'dark-bg': '#0c0e14',
        'dark-surface': '#131722',
        'dark-card': '#1a1f2c',
        'dark-card-hover': '#23293a',
        'dark-border': '#2d3748',
        'crimson-soft': '#e11d48',
        'wine-muted': '#be123c',
        'light-bg': '#f8fafc',
        'light-surface': '#ffffff',
        'light-card': '#f1f5f9',
      },
      fontFamily: {
        bebas: ['"Bebas Neue"', 'sans-serif'],
        display: ['"Bebas Neue"', 'sans-serif'],
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
