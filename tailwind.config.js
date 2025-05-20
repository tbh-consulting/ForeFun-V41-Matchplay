/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#10B981',
        secondary: '#6B7280',
        accent: '#3B82F6',
        background: '#F8FAFC',
      },
      fontSize: {
        sm: '14px',
        base: '16px',
        heading: '24px',
      },
      borderRadius: {
        DEFAULT: '12px',
        'lg': '16px',
        'full': '9999px',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      spacing: {
        1: '4px',
        2: '8px',
        4: '16px',
        6: '24px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 2px 8px -2px rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 4px 12px -2px rgba(0, 0, 0, 0.08)',
        'lg': '0 8px 24px -4px rgba(0, 0, 0, 0.12)',
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
};