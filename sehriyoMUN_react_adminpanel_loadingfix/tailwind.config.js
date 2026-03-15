/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'] },
      colors: {
        // Sehriyo MUN (red primary)
        brand: { 900: '#9B111E', 500: '#E11D48', 50: '#FFF1F2' }
      },
      boxShadow: {
        soft: '0 10px 30px rgba(2,6,23,0.08)',
        glow: '0 0 0 6px rgba(225,29,72,0.18)',
      }
      ,
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        floaty: 'floaty 7s ease-in-out infinite',
        floatySlow: 'floaty 10s ease-in-out infinite',
        shimmer: 'shimmer 10s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
