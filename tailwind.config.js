/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-green': '#8CC63F',
        'brand-green-dark': '#4F7C20',
        'brand-red': '#E30613',
        'brand-red-dark': '#B8000B',
        'brand-ink': '#111827',
      },
      fontFamily: {
        display: ['Nunito', 'ui-rounded', 'system-ui', 'sans-serif'],
        sans: ['Nunito', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 28px rgba(17, 24, 39, 0.07)',
      },
    },
  },
  plugins: [],
};