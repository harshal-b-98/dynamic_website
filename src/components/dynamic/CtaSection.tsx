/**
 * CTA Section Component
 *
 * Call-to-action section using shadcn/ui Button
 * with interactive elements that trigger AI page generation
 */

import { DynamicComponentProps } from '@/lib/component-loader'
import { Button } from '@/components/ui/button'

export default function CtaSection({ spec, onInteraction }: DynamicComponentProps) {
  const { props, content, styling } = spec
  const theme = styling?.theme || 'brand'

  // Handler for button clicks
  const handleClick = (label: string, action: string) => {
    if (onInteraction) {
      onInteraction({
        interactionType: 'cta',
        label,
        action,
        intent: action.includes('demo') ? 'request-demo' :
                action.includes('start') ? 'get-started' : 'learn-more',
      })
    }
  }

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
              onClick={() => handleClick(props.primaryCta || content?.primaryCta, 'primary-cta')}
            >
              {props.primaryCta || content?.primaryCta}
            </Button>
          )}

          {/* Secondary CTA */}
          {(props.secondaryCta || content?.secondaryCta) && (
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleClick(props.secondaryCta || content?.secondaryCta, 'secondary-cta')}
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
