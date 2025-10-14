import type { Config } from 'tailwindcss'
import { colors, typography, shadows, borderRadius, transitions, zIndex } from './src/lib/design-tokens'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      // Colors - merge existing with design tokens
      colors: {
        // CSS variable colors (for runtime theme switching)
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        muted: 'var(--color-muted)',
        border: 'var(--color-border)',

        // Brand colors
        primary: colors.brand.primary,
        secondary: colors.brand.secondary,
        accent: colors.brand.accent,

        // Legacy color names (maintain backward compatibility)
        'deep-indigo': colors.brand.secondary,
        'electric-cyan': colors.brand.primary,
        'refined-copper': colors.brand.accent,
        'surface-white': colors.surface.white,
        'light-data-gray': colors.surface.light,
        'charcoal-gray': colors.surface.charcoal,
        'data-green': colors.semantic.success.DEFAULT,
        'risk-red': colors.semantic.error.DEFAULT,

        // Semantic colors
        success: colors.semantic.success,
        error: colors.semantic.error,
        warning: colors.semantic.warning,
        info: colors.semantic.info,

        // Grayscale
        gray: colors.gray,

        // Surface colors
        surface: colors.surface,
      },

      // Typography
      fontFamily: {
        sans: typography.fontFamily.sans,
        display: typography.fontFamily.display,
        mono: typography.fontFamily.mono,
        // Legacy names
        'mont': typography.fontFamily.display,
        'inter': typography.fontFamily.sans,
      },
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,

      // Shadows
      boxShadow: shadows,

      // Border radius
      borderRadius: borderRadius,

      // Transitions
      transitionDuration: transitions.duration,
      transitionTimingFunction: transitions.timing,

      // Z-index
      zIndex: zIndex,

      // Animations
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
