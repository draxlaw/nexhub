/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Amazon Brand Colors
        amazon: {
          blue: '#007185',
          'blue-dark': '#00464f',
          blueLight: '#00a8e8',
          orange: '#FFA41C',
          'light-orange': '#FF9900',
          green: '#4CAF50',
          'dark-green': '#388E3C',
          'light-green': '#81C784',
          dark: '#232F3E',
          'dark-hover': '#1a2a36',
          light: '#EAEDED',
          'light-2': '#F7F8F8',
          yellow: '#F7CA00',
          red: '#CC0C39',
        }
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
      },
      boxShadow: {
        'amazon': '0 2px 5px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.08)',
        'amazon-hover': '0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
        'card': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

