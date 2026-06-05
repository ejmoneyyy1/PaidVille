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
        // Semantic surfaces/text driven by CSS vars so the whole site themes from :root.
        // Names kept for compatibility; values resolve dark in the current immersive theme.
        cream: 'rgb(var(--cream) / <alpha-value>)',
        silver: 'rgb(var(--silver) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        ink: '#0E0E10', // fixed near-black for surfaces that must stay dark in any theme
        'pv-red': '#B00000',
        charcoal: 'rgb(var(--charcoal) / <alpha-value>)',
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
        'meteor-effect': 'meteor-effect 5s linear infinite',
        'float-orb': 'float-orb 20s ease-in-out infinite',
        'grid-scroll': 'grid-scroll 1.7s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': {transform: 'translateY(0px)'},
          '50%': {transform: 'translateY(-12px)'},
        },
        'meteor-effect': {
          '0%': {transform: 'rotate(215deg) translateX(0)', opacity: '0'},
          '10%': {opacity: '1'},
          '70%': {opacity: '1'},
          '100%': {transform: 'rotate(215deg) translateX(-720px)', opacity: '0'},
        },
        'float-orb': {
          '0%, 100%': {transform: 'translate(0px, 0px) scale(1)'},
          '33%': {transform: 'translate(46px, -34px) scale(1.12)'},
          '66%': {transform: 'translate(-32px, 24px) scale(0.94)'},
        },
        'grid-scroll': {
          '0%': {backgroundPosition: '0px 0px'},
          '100%': {backgroundPosition: '0px 64px'},
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
