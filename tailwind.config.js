/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#d8343d',
        secondary: '#2c659c',
        dark: '#121212',
        header: '#808080',
        'gray-750': '#2d3748',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}; 