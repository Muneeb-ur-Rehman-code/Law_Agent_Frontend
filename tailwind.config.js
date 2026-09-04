/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A2342',
          light: '#133560',
          dark: '#051427',
        },
        gold: {
          DEFAULT: '#C9A84C',
          hover: '#B5943A',
          light: '#F4E8C1',
        },
        'light-gray': '#F4F6F9',
        dark: '#1A1A2E',
        mid: '#4A5568',
        success: '#1A6B3C',
        danger: '#DC2626',
        warning: '#D97706',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
