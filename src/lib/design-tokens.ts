/**
 * Design Tokens
 *
 * Centralized design system tokens for colors, typography, spacing, and more.
 * These tokens are used by Tailwind CSS and can be accessed programmatically.
 */

export const colors = {
  // Brand colors
  brand: {
    primary: '#00C8FF', // Electric cyan
    secondary: '#0A1930', // Deep indigo
    accent: '#AA6C39', // Refined copper
  },

  // Semantic colors
  semantic: {
    success: {
      DEFAULT: '#198038',
      light: '#22C55E',
      dark: '#166534',
      bg: '#F0FDF4',
      border: '#BBF7D0',
    },
    error: {
      DEFAULT: '#DA1E28',
      light: '#EF4444',
      dark: '#991B1B',
      bg: '#FEF2F2',
      border: '#FECACA',
    },
    warning: {
      DEFAULT: '#F59E0B',
      light: '#FBBF24',
      dark: '#B45309',
      bg: '#FFFBEB',
      border: '#FDE68A',
    },
    info: {
      DEFAULT: '#00C8FF',
      light: '#38BDF8',
      dark: '#0369A1',
      bg: '#F0F9FF',
      border: '#BAE6FD',
    },
  },

  // Grayscale
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },

  // Surface colors
  surface: {
    white: '#FFFFFF',
    light: '#EBEFF2',
    dark: '#0A1930',
    charcoal: '#333333',
  },
} as const

export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    display: ['Montserrat', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'monospace'],
  },

  // Font sizes (with line heights)
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
    base: ['1rem', { lineHeight: '1.5rem' }], // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1' }], // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }], // 60px
    '7xl': ['4.5rem', { lineHeight: '1' }], // 72px
    '8xl': ['6rem', { lineHeight: '1' }], // 96px
    '9xl': ['8rem', { lineHeight: '1' }], // 128px
  },

  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
} as const

export const spacing = {
  // Base spacing scale (4px increments)
  0: '0px',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
} as const

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
  // Custom shadows
  glow: '0 0 20px rgba(0, 200, 255, 0.3)',
  'glow-strong': '0 0 40px rgba(0, 200, 255, 0.5)',
} as const

export const borderRadius = {
  none: '0px',
  sm: '0.125rem', // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
} as const

export const transitions = {
  // Duration
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },

  // Timing functions
  timing: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
  // Semantic z-index
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  'modal-backdrop': '1040',
  modal: '1050',
  popover: '1060',
  tooltip: '1070',
} as const

// CSS custom properties for runtime theme switching
export const cssVariables = {
  light: {
    '--color-primary': colors.brand.primary,
    '--color-secondary': colors.brand.secondary,
    '--color-accent': colors.brand.accent,
    '--color-success': colors.semantic.success.DEFAULT,
    '--color-error': colors.semantic.error.DEFAULT,
    '--color-warning': colors.semantic.warning.DEFAULT,
    '--color-info': colors.semantic.info.DEFAULT,
    '--color-background': colors.surface.white,
    '--color-foreground': colors.gray[900],
    '--color-muted': colors.gray[500],
    '--color-border': colors.gray[200],
  },
  dark: {
    '--color-primary': colors.brand.primary,
    '--color-secondary': colors.brand.secondary,
    '--color-accent': colors.brand.accent,
    '--color-success': colors.semantic.success.light,
    '--color-error': colors.semantic.error.light,
    '--color-warning': colors.semantic.warning.light,
    '--color-info': colors.semantic.info.light,
    '--color-background': colors.surface.dark,
    '--color-foreground': colors.gray[50],
    '--color-muted': colors.gray[400],
    '--color-border': colors.gray[700],
  },
} as const

// Export all design tokens
export const designTokens = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  transitions,
  breakpoints,
  zIndex,
  cssVariables,
} as const

export default designTokens
