/**
 * Hero Section Component
 *
 * Primary page introduction with headline, subheading, and CTA
 */

import { DynamicComponentProps } from '@/lib/component-loader'

export default function HeroSection({ spec }: DynamicComponentProps) {
  const { props, content, styling } = spec
  const size = styling?.size || 'lg'
  const theme = styling?.theme || 'light'

  const sizeClasses = {
    sm: 'py-12',
    md: 'py-16',
    lg: 'py-24',
    xl: 'py-32'
  }

  const themeClasses = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-white',
    brand: 'bg-gradient-to-br from-[var(--deep-indigo)] to-[var(--electric-cyan)] text-white'
  }

  return (
    <section
      className={`hero-section ${sizeClasses[size]} ${themeClasses[theme]} -mx-4 px-4 md:-mx-8 md:px-8`}
    >
      <div className="max-w-5xl mx-auto text-center">
        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          {props.headline || content?.headline || 'Welcome to ConsumerIQ'}
        </h1>

        {/* Subheading */}
        {(props.subheading || content?.subheading) && (
          <p className="text-lg md:text-xl lg:text-2xl mb-8 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {props.subheading || content?.subheading}
          </p>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {(props.ctaText || content?.ctaText) && (
            <button
              className="px-8 py-3 bg-[var(--electric-cyan)] text-[var(--deep-indigo)] font-semibold rounded-lg hover:bg-opacity-90 transition-all transform hover:scale-105"
              onClick={() => {
                // TODO: Handle CTA click
                console.log('CTA clicked:', props.ctaText || content?.ctaText)
              }}
            >
              {props.ctaText || content?.ctaText}
            </button>
          )}

          {(props.secondaryCta || content?.secondaryCta) && (
            <button
              className="px-8 py-3 bg-transparent border-2 border-current font-semibold rounded-lg hover:bg-white hover:bg-opacity-10 transition-all"
              onClick={() => {
                console.log('Secondary CTA clicked:', props.secondaryCta || content?.secondaryCta)
              }}
            >
              {props.secondaryCta || content?.secondaryCta}
            </button>
          )}
        </div>

        {/* Image/Visual */}
        {(props.imageUrl || content?.imageUrl) && (
          <div className="mt-12">
            <img
              src={props.imageUrl || content?.imageUrl}
              alt={props.imageAlt || content?.imageAlt || 'Hero image'}
              className="w-full max-w-4xl mx-auto rounded-lg shadow-2xl"
            />
          </div>
        )}
      </div>
    </section>
  )
}
