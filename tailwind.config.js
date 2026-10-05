const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tailwind 2 `green` was the palette renamed to `emerald` in Tailwind 3
        green: colors.emerald,
        paper: '#f4f1ea',
        ink: '#1c1b18',
        muted: '#5c5850',
        rule: '#d9d4c7',
        // Colors taken from the evertcode mascot (assets/logo.svg)
        lime: '#84cc16',
        moss: '#3f6212'
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace']
      }
    }
  },
  plugins: []
}
