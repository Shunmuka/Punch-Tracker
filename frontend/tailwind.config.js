/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#00FFFF',
        'dark-bg': '#0B0F14',
        'dark-surface': '#141A22',
        'dark-card': '#1F2937',
      }
    },
  },
  plugins: [],
}
