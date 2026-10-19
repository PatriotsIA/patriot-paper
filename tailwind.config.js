/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        patriot: {
          bg: '#ffffff',
          bgSoft: '#f4f3ef',
          bgWarm: '#eeece6',
          border: '#dedfde',
          text: '#384255',
          muted: '#5d6676',
          navy: '#172354',
          blue: '#283d78',
          blueDark: '#172354',
          red: '#c92539',
          redDark: '#a61d2e',
          white: '#ffffff',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glowRed: '0 4px 12px rgba(23, 35, 84, 0.08)',
        glowBlue: '0 4px 12px rgba(23, 35, 84, 0.08)',
        card: '0 8px 28px rgba(23, 35, 84, 0.035)',
      },

    },
  },
  plugins: [],
}

