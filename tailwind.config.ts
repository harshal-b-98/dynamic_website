import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // ConsumerIQ Brand Colors
        'deep-indigo': {
          DEFAULT: '#0A1930',
          '50': '#E6EAF0',
          '100': '#C2CCDC',
          '200': '#9BADC7',
          '300': '#748FB2',
          '400': '#4D709D',
          '500': '#265288',
          '600': '#1F416D',
          '700': '#183152',
          '800': '#0A1930',
          '900': '#050C18',
        },
        'electric-cyan': {
          DEFAULT: '#00C8FF',
          '50': '#E5F8FF',
          '100': '#B8EDFF',
          '200': '#8AE2FF',
          '300': '#5CD7FF',
          '400': '#2ECDFF',
          '500': '#00C8FF',
          '600': '#00A0CC',
          '700': '#007899',
          '800': '#005066',
          '900': '#002833',
        },
        'refined-copper': '#AA6C39',
        'surface-white': '#FFFFFF',
        'light-data-gray': '#EBEFF2',
        'charcoal-gray': '#333333',
        'data-green': '#198038',
        'risk-red': '#DA1E28',
      },
      fontFamily: {
        'mont': ['Montserrat', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      fontSize: {
        'hero-desktop': '56px',
        'hero-mobile': '32px',
        'body-base': '16px',
        'body-large': '18px',
        'label': '14px',
      },
      lineHeight: {
        'brand': '1.6',
        'tight-brand': '1.5',
        'relaxed-brand': '1.8',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to bottom, #0A1930, #000000)',
        'cta-gradient': 'linear-gradient(to right, #00C8FF, #0099CC)',
      },
    },
  },
  plugins: [],
}
export default config
