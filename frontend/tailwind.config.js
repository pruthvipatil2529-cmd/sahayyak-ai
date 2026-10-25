/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sahayyak: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        warm: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        }
      },
      fontSize: {
        'elder-sm': ['1.05rem', { lineHeight: '1.6' }],
        'elder-base': ['1.25rem', { lineHeight: '1.75' }],
        'elder-lg': ['1.45rem', { lineHeight: '1.8' }],
        'elder-xl': ['1.75rem', { lineHeight: '2' }],
        'elder-2xl': ['2.2rem', { lineHeight: '2.25' }],
      }
    },
  },
  plugins: [],
}
