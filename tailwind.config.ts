import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0F2027',
          card: '#1C3040',
          border: '#274055',
          accent: '#F4A600',
          text: '#E8EDF2',
          muted: '#7A9AB2',
          success: '#22C55E',
          danger: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        syne: ['"Syne"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 24px 70px rgba(7, 17, 24, 0.35)',
      },
      backgroundImage: {
        glow:
          'radial-gradient(circle at top, rgba(244, 166, 0, 0.16), transparent 35%)',
      },
    },
  },
  plugins: [],
} satisfies Config
