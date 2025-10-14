/**
 * Hero Section Component
 *
 * Primary page introduction with headline, subheading, and CTA
 * Enhanced with shadcn/Vercel/Tailwind design system standards
 */

import { DynamicComponentProps } from '@/lib/component-loader'
import { typography, sizes, radius, animations, shadows } from '@/lib/design-system'

export default function HeroSection({ spec, onInteraction }: DynamicComponentProps) {
  const { props, content, styling } = spec
  const size = styling?.size || 'xl' // Default to xl for hero sections
  const theme = styling?.theme || 'light'

  // Handle button clicks
  const handleClick = (label: string, action: string) => {
    if (onInteraction) {
      onInteraction({
        interactionType: 'button',
        label,
        action,
        intent: action.includes('demo') ? 'request-demo' :
                action.includes('start') ? 'get-started' : 'learn-more',
      })
    }
  }

  // Use design system sizes
  const sizeClasses = {
    sm: sizes.section.sm,
    md: sizes.section.md,
    lg: sizes.section.lg,
    xl: sizes.section.xl
  }

  const themeClasses = {
    light: 'bg-gradient-to-b from-white to-gray-50 text-[var(--charcoal-gray)]',
    dark: 'bg-gradient-to-br from-[var(--deep-indigo)] to-[#0d1f3d] text-white',
    brand: 'bg-gradient-to-br from-[var(--deep-indigo)] via-[#0d2340] to-[var(--electric-cyan)] text-white'
  }

  return (
    <section
      className={`hero-section ${sizeClasses[size]} ${themeClasses[theme]} ${radius['2xl']} -mx-4 px-6 md:-mx-0 md:px-12`}
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Headline - Using design system typography */}
        <h1 className={`${typography.display.lg} mb-8`}>
          {props.headline || content?.headline || 'Welcome to ConsumerIQ'}
        </h1>

        {/* Subheading - Using design system typography */}
        {(props.subheading || content?.subheading) && (
          <p className={`${typography.body.lg} mb-12 opacity-90 max-w-3xl mx-auto`}>
            {props.subheading || content?.subheading}
          </p>
        )}

        {/* CTAs - Using design system */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
          {(props.ctaText || content?.ctaText) && (
            <button
              className={`${sizes.button.xl} bg-[var(--electric-cyan)] text-[var(--deep-indigo)] font-bold ${radius.xl} ${shadows.hover} ${animations.hoverScale}`}
              onClick={() => handleClick(props.ctaText || content?.ctaText, 'primary-cta')}
            >
              {props.ctaText || content?.ctaText}
            </button>
          )}

          {(props.secondaryCta || content?.secondaryCta) && (
            <button
              className={`${sizes.button.xl} bg-transparent border-2 border-current font-bold ${radius.xl} hover:bg-white hover:bg-opacity-10 transition-all duration-300`}
              onClick={() => handleClick(props.secondaryCta || content?.secondaryCta, 'secondary-cta')}
            >
              {props.secondaryCta || content?.secondaryCta}
            </button>
          )}
        </div>

        {/* Image/Visual - Using design system */}
        {(props.imageUrl || content?.imageUrl) && (
          <div className="mt-12">
            <img
              src={props.imageUrl || content?.imageUrl}
              alt={props.imageAlt || content?.imageAlt || 'Hero image'}
              className={`w-full max-w-4xl mx-auto ${radius.lg} ${shadows['2xl']}`}
            />
          </div>
        )}
      </div>
    </section>
  )
}
