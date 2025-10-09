/**
 * CTA Section Component
 *
 * Call-to-action section using shadcn/ui Button
 */

import { DynamicComponentProps } from '@/lib/component-loader'
import { Button } from '@/components/ui/button'

export default function CtaSection({ spec }: DynamicComponentProps) {
  const { props, content, styling } = spec
  const theme = styling?.theme || 'brand'

  const themeClasses = {
    light: 'bg-gray-100',
    dark: 'bg-gray-900 text-white',
    brand: 'bg-gradient-to-r from-[var(--deep-indigo)] to-blue-900 text-white'
  }

  return (
    <section className={`cta-section ${themeClasses[theme]} -mx-4 px-4 md:-mx-8 md:px-8 py-16 rounded-lg`}>
      <div className="max-w-4xl mx-auto text-center">
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {props.headline || content?.headline || 'Ready to get started?'}
        </h2>

        {/* Description */}
        {(props.description || content?.description) && (
          <p className="text-lg md:text-xl mb-8 opacity-90">
            {props.description || content?.description}
          </p>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Primary CTA */}
          {(props.primaryCta || content?.primaryCta) && (
            <Button
              size="lg"
              variant={theme === 'brand' || theme === 'dark' ? 'secondary' : 'default'}
              onClick={() => {
                console.log('Primary CTA clicked:', props.primaryCta || content?.primaryCta)
              }}
            >
              {props.primaryCta || content?.primaryCta}
            </Button>
          )}

          {/* Secondary CTA */}
          {(props.secondaryCta || content?.secondaryCta) && (
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                console.log('Secondary CTA clicked:', props.secondaryCta || content?.secondaryCta)
              }}
            >
              {props.secondaryCta || content?.secondaryCta}
            </Button>
          )}
        </div>

        {/* Subtext */}
        {(props.subtext || content?.subtext) && (
          <p className="mt-6 text-sm opacity-75">
            {props.subtext || content?.subtext}
          </p>
        )}
      </div>
    </section>
  )
}
