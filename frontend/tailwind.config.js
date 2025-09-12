/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Design System Colors
        bg: '#0F1115',
        surface: '#161a20',
        surface2: '#1F2430',
        text: '#EAECEF',
        muted: '#9AA4AF',
        primary: { 
          DEFAULT: '#E53935', 
          600: '#C62828' 
        },
        // Legacy colors for login page compatibility
        'punch-red': '#E53935',
        'punch-orange': '#FF6A00',
        'dark-bg': '#0F1115',
        'card-bg': '#161a20',
        'input-bg': '#1F2430',
        'text-primary': '#EAECEF',
        'text-secondary': '#9AA4AF',
        'border-gray': '#242a35'
      },
      fontFamily: {
        'athletic': ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px'
      },
      boxShadow: {
        'card': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'button': '0 4px 16px rgba(229, 57, 53, 0.3)',
        'soft': '0 8px 24px rgba(0,0,0,0.35)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'punch-pattern': 'linear-gradient(135deg, rgba(229, 57, 53, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)',
        'primary-gradient': 'linear-gradient(135deg, #E53935 0%, #FF6A00 100%)'
      }
    },
  },
  plugins: [],
}
