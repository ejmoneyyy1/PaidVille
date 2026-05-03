import type {Config} from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5F5F0',
        silver: '#E5E5E5',
        'pv-red': '#B00000',
        charcoal: '#1A1A1A',
        brand: {
          red: '#B00000',
          'red-light': '#D40000',
          'red-dark': '#800000',
          black: '#0A0A0A',
          'dark-surface': '#111111',
          'card-surface': '#1A1A1A',
          muted: '#2A2A2A',
          'text-dim': '#9A9A9A',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-montserrat)', 'Montserrat', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': {transform: 'translateY(0px)'},
          '50%': {transform: 'translateY(-12px)'},
        },
      },
      backgroundImage: {
        'radial-brand': 'radial-gradient(ellipse at center, rgba(176,0,0,0.12) 0%, transparent 70%)',
        'gradient-brand': 'linear-gradient(135deg, #B00000 0%, #800000 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
