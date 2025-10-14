/**
 * Design System
 *
 * Unified design tokens and standards based on:
 * - shadcn/ui principles (consistent, accessible, beautiful)
 * - Vercel design language (clean, minimal, spacious)
 * - Tailwind CSS best practices (utility-first, responsive)
 */

/**
 * Spacing Scale (Tailwind-inspired, Vercel-calibrated)
 */
export const spacing = {
  // Component spacing (between elements within a component)
  xs: 'space-y-2',   // 8px  - Tight grouping
  sm: 'space-y-4',   // 16px - Related items
  md: 'space-y-6',   // 24px - Section elements
  lg: 'space-y-8',   // 32px - Major sections
  xl: 'space-y-12',  // 48px - Component boundaries

  // Page layout spacing (between components)
  page: {
    compact: 'space-y-12',   // 48px  - Minimum
    normal: 'space-y-16',     // 64px  - Standard
    spacious: 'space-y-20',   // 80px  - Recommended (Vercel-style)
    luxurious: 'space-y-24',  // 96px  - Premium feel
  },

  // Container padding
  container: {
    sm: 'px-4 py-8',   // Mobile
    md: 'px-6 py-12',  // Tablet
    lg: 'px-8 py-16',  // Desktop
    xl: 'px-12 py-20', // Wide screens
  }
} as const

/**
 * Typography Scale (shadcn-inspired)
 */
export const typography = {
  // Display (Hero headlines)
  display: {
    sm: 'text-4xl font-extrabold tracking-tight',
    md: 'text-5xl font-extrabold tracking-tight',
    lg: 'text-6xl font-extrabold tracking-tight',
    xl: 'text-7xl font-extrabold tracking-tighter',
  },

  // Headings
  h1: 'text-4xl md:text-5xl font-bold tracking-tight',
  h2: 'text-3xl md:text-4xl font-bold tracking-tight',
  h3: 'text-2xl md:text-3xl font-semibold tracking-tight',
  h4: 'text-xl md:text-2xl font-semibold',
  h5: 'text-lg md:text-xl font-semibold',
  h6: 'text-base md:text-lg font-semibold',

  // Body text
  body: {
    lg: 'text-lg md:text-xl leading-relaxed',
    md: 'text-base md:text-lg leading-relaxed',
    sm: 'text-sm md:text-base leading-relaxed',
  },

  // UI text
  label: 'text-sm font-medium',
  caption: 'text-xs text-gray-600',
  code: 'font-mono text-sm bg-gray-100 px-1.5 py-0.5 rounded',
} as const

/**
 * Component Sizes (shadcn standard)
 */
export const sizes = {
  // Button sizes
  button: {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  },

  // Input sizes
  input: {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  },

  // Card sizes
  card: {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  },

  // Section sizes (hero, feature, etc.)
  section: {
    sm: 'py-12',
    md: 'py-16',
    lg: 'py-24',
    xl: 'py-32',
  }
} as const

/**
 * Border Radius (shadcn standard)
 */
export const radius = {
  none: 'rounded-none',
  sm: 'rounded-sm',      // 2px
  md: 'rounded-md',      // 4px - shadcn default
  lg: 'rounded-lg',      // 8px - cards, buttons
  xl: 'rounded-xl',      // 12px - sections, modals
  '2xl': 'rounded-2xl',  // 16px - hero sections
  '3xl': 'rounded-3xl',  // 24px - showcase elements
  full: 'rounded-full',  // Pills, avatars
} as const

/**
 * Shadows (Vercel-style elevation)
 */
export const shadows = {
  none: 'shadow-none',
  sm: 'shadow-sm',             // Subtle lift
  md: 'shadow-md',             // Standard card
  lg: 'shadow-lg',             // Elevated card
  xl: 'shadow-xl',             // Modal, drawer
  '2xl': 'shadow-2xl',         // Hero images
  inner: 'shadow-inner',       // Recessed inputs

  // Vercel-style colored shadows
  brand: 'shadow-lg shadow-blue-500/10',
  hover: 'hover:shadow-xl hover:shadow-blue-500/20 transition-shadow duration-300',
} as const

/**
 * Color Palette (Brand + Semantic)
 */
export const colors = {
  // Brand colors (from your CSS vars)
  brand: {
    primary: 'text-[var(--electric-cyan)]',
    primaryBg: 'bg-[var(--electric-cyan)]',
    secondary: 'text-[var(--deep-indigo)]',
    secondaryBg: 'bg-[var(--deep-indigo)]',
    accent: 'text-[var(--bright-coral)]',
    accentBg: 'bg-[var(--bright-coral)]',
  },

  // Semantic colors (Tailwind defaults)
  semantic: {
    success: 'text-green-600',
    successBg: 'bg-green-50 border-green-200',
    warning: 'text-yellow-600',
    warningBg: 'bg-yellow-50 border-yellow-200',
    error: 'text-red-600',
    errorBg: 'bg-red-50 border-red-200',
    info: 'text-blue-600',
    infoBg: 'bg-blue-50 border-blue-200',
  },

  // Neutrals (shadcn-style)
  neutral: {
    50: 'text-gray-50',
    100: 'text-gray-100',
    200: 'text-gray-200',
    300: 'text-gray-300',
    400: 'text-gray-400',
    500: 'text-gray-500',
    600: 'text-gray-600',
    700: 'text-gray-700',
    800: 'text-gray-800',
    900: 'text-gray-900',
  }
} as const

/**
 * Animations (Vercel-smooth)
 */
export const animations = {
  // Fade
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',

  // Slide
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',

  // Scale
  scaleIn: 'animate-scale-in',
  scaleOut: 'animate-scale-out',

  // Transitions
  fast: 'transition-all duration-150',
  normal: 'transition-all duration-300',
  slow: 'transition-all duration-500',

  // Hover effects (Vercel-style)
  hoverLift: 'hover:-translate-y-1 hover:shadow-lg transition-all duration-300',
  hoverScale: 'hover:scale-105 transition-transform duration-300',
  hoverGlow: 'hover:shadow-xl hover:shadow-blue-500/25 transition-shadow duration-300',
} as const

/**
 * Layout Containers (Max widths)
 */
export const containers = {
  xs: 'max-w-screen-xs',   // 480px
  sm: 'max-w-screen-sm',   // 640px
  md: 'max-w-screen-md',   // 768px
  lg: 'max-w-screen-lg',   // 1024px
  xl: 'max-w-screen-xl',   // 1280px
  '2xl': 'max-w-screen-2xl', // 1536px

  // Content-focused (shadcn standard)
  prose: 'max-w-prose',    // ~65ch (optimal reading width)
  content: 'max-w-4xl',    // 56rem - Standard content
  wide: 'max-w-6xl',       // 72rem - Wide content
  full: 'max-w-full',      // Full width
} as const

/**
 * Grid Systems
 */
export const grids = {
  // Feature grids
  features: {
    '2col': 'grid grid-cols-1 md:grid-cols-2 gap-8',
    '3col': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
    '4col': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
  },

  // Card grids
  cards: {
    '2col': 'grid grid-cols-1 lg:grid-cols-2 gap-6',
    '3col': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  },

  // Dashboard grids
  dashboard: {
    '2col': 'grid grid-cols-1 lg:grid-cols-2 gap-6',
    '3col': 'grid grid-cols-1 lg:grid-cols-3 gap-6',
    '4col': 'grid grid-cols-2 lg:grid-cols-4 gap-4',
  }
} as const

/**
 * Component Presets (Vercel/shadcn combos)
 */
export const presets = {
  // Hero section (Vercel-style)
  hero: {
    container: `${containers.wide} mx-auto ${sizing.section.xl} px-6`,
    headline: `${typography.display.lg} mb-6`,
    subheading: `${typography.body.lg} ${colors.neutral[600]} mb-8`,
    cta: `${sizes.button.lg} ${radius.lg} ${animations.hoverLift}`,
  },

  // Feature grid (shadcn-style)
  feature: {
    container: `${containers.wide} mx-auto ${spacing.page.spacious}`,
    grid: grids.features['3col'],
    card: `${sizes.card.lg} ${radius.xl} ${shadows.md} ${animations.hoverLift}`,
    icon: 'w-12 h-12 mb-4',
    title: `${typography.h4} mb-2`,
    description: `${typography.body.sm} ${colors.neutral[600]}`,
  },

  // Card component
  card: {
    base: `${radius.lg} ${shadows.md} ${animations.fast} hover:shadow-xl`,
    padding: sizes.card.lg,
    header: `${typography.h5} mb-4`,
    body: `${typography.body.md} ${colors.neutral[700]}`,
  },

  // CTA section
  cta: {
    container: `${containers.content} mx-auto ${sizes.section.lg} px-6 text-center`,
    background: `${radius['2xl']} bg-gradient-to-br from-[var(--deep-indigo)] to-[var(--electric-cyan)]`,
    title: `${typography.h2} text-white mb-4`,
    button: `${sizes.button.xl} ${radius.lg} bg-white text-[var(--deep-indigo)] ${animations.hoverScale}`,
  }
} as const

/**
 * Responsive Breakpoints
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

/**
 * Helper: Get component classes
 */
export function getComponentClasses(
  component: 'hero' | 'feature' | 'card' | 'cta',
  element: string
): string {
  return presets[component][element as keyof typeof presets[typeof component]] || ''
}

/**
 * Helper: Combine classes (handles conflicts)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
