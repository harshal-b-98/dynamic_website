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
        'deep-indigo': '#0A1930',
        'electric-cyan': '#00C8FF',
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
    },
  },
  plugins: [],
}
export default config
