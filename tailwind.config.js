const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tailwind 2 `green` was the palette renamed to `emerald` in Tailwind 3
        green: colors.emerald
      },
      fontFamily: {
        popins: ['"Poppins"', 'sans-serif']
      }
    }
  },
  plugins: []
}
