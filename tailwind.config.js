module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-green': '#48A031',
        'brand-dark': '#081F07',
        'brand-accent': '#23501B',
        'brand-light': '#E9FEE1',
        'brand-white': '#FFFFFF',
      },
    },
  },
  plugins: [],
}; 