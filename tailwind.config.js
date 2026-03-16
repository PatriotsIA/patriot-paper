/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        patriot: {
          bg: '#ffffff',
          bgSoft: '#f5f7fe',
          bgWarm: '#f7f4f0',
          border: '#d4d8e9',
          text: '#363636',
          muted: '#5b6475',
          navy: '#1b2673',
          blue: '#6094e1',
          blueDark: '#1b2673',
          red: '#be1e2d',
          redDark: '#8a0f18',
          white: '#ffffff',
        },
      },
      fontFamily: {
        display: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glowRed: '0 0 0 1px rgba(190, 30, 45, 0.25), 0 14px 44px rgba(190, 30, 45, 0.10)',
        glowBlue: '0 0 0 1px rgba(96, 148, 225, 0.25), 0 14px 44px rgba(96, 148, 225, 0.12)',
        card: '0 18px 60px rgba(27, 38, 115, 0.10)',
      },
      backgroundImage: {
        heroRays:
          'radial-gradient(120% 95% at 50% 0%, rgba(96, 148, 225, 0.22) 0%, rgba(190, 30, 45, 0.10) 40%, rgba(245, 247, 254, 0) 72%)',
      },
    },
  },
  plugins: [],
}

