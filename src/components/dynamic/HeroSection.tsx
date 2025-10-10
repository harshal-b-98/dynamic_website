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
    sm: 'py-16',
    md: 'py-20',
    lg: 'py-28',
    xl: 'py-36'
  }

  const themeClasses = {
    light: 'bg-gradient-to-b from-white to-gray-50 text-[var(--charcoal-gray)]',
    dark: 'bg-gradient-to-br from-[var(--deep-indigo)] to-[#0d1f3d] text-white',
    brand: 'bg-gradient-to-br from-[var(--deep-indigo)] via-[#0d2340] to-[var(--electric-cyan)] text-white'
  }

  return (
    <section
      className={`hero-section ${sizeClasses[size]} ${themeClasses[theme]} rounded-2xl -mx-4 px-6 md:-mx-0 md:px-12`}
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-mont font-extrabold mb-8 leading-tight tracking-tight">
          {props.headline || content?.headline || 'Welcome to ConsumerIQ'}
        </h1>

        {/* Subheading */}
        {(props.subheading || content?.subheading) && (
          <p className="text-xl md:text-2xl mb-12 opacity-90 leading-relaxed max-w-3xl mx-auto font-inter">
            {props.subheading || content?.subheading}
          </p>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
          {(props.ctaText || content?.ctaText) && (
            <button
              className="px-10 py-4 bg-[var(--electric-cyan)] text-[var(--deep-indigo)] font-mont font-bold text-lg rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
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
              className="px-10 py-4 bg-transparent border-2 border-current font-mont font-bold text-lg rounded-xl hover:bg-white hover:bg-opacity-10 transition-all duration-300"
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
