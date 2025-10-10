/**
 * Feature Grid Component
 *
 * Grid layout displaying features with icons, titles, and descriptions
 */

import { DynamicComponentProps } from '@/lib/component-loader'

interface Feature {
  icon?: string
  title: string
  description: string
  link?: string
}

// Icon mapping for common icon names to SVG components
const IconMap: Record<string, React.FC<{ className?: string }>> = {
  'chart-line': ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
  ),
  'dashboard': ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  'cog': ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  'users': ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  'lightning': ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  'shield': ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  'sparkles': ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  'rocket': ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  'default': ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}

export default function FeatureGrid({ spec }: DynamicComponentProps) {
  const { props, content, styling } = spec

  const features: Feature[] = props.features || content?.features || []
  const columns = props.columns || styling?.variant || '3'

  const gridCols = {
    '2': 'grid-cols-1 md:grid-cols-2',
    '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  const gridClass = gridCols[columns as keyof typeof gridCols] || gridCols['3']

  return (
    <div className="feature-grid">
      {/* Section Header */}
      {(props.title || content?.title) && (
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {props.title || content?.title}
          </h2>
          {(props.subtitle || content?.subtitle) && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {props.subtitle || content?.subtitle}
            </p>
          )}
        </div>
      )}

      {/* Features Grid */}
      <div className={`grid ${gridClass} gap-6 lg:gap-8`}>
        {features.map((feature, index) => {
          // Get the appropriate icon component
          const IconComponent = feature.icon && IconMap[feature.icon]
            ? IconMap[feature.icon]
            : IconMap['default']

          return (
            <div
              key={index}
              className="feature-card p-6 bg-white border border-gray-200 rounded-xl hover:shadow-xl hover:border-[var(--electric-cyan)] transition-all duration-300 group"
            >
              {/* Icon */}
              {feature.icon && (
                <div className="mb-4">
                  {feature.icon.startsWith('http') ? (
                    <img src={feature.icon} alt="" className="w-12 h-12" />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-[var(--electric-cyan)] to-[var(--deep-indigo)] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <div className="text-white">
                        <IconComponent className="w-7 h-7" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Title */}
              <h3 className="text-xl font-semibold text-[var(--charcoal-gray)] mb-3 font-mont">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-[var(--charcoal-gray)] opacity-80 leading-relaxed font-inter break-words">
                {feature.description}
              </p>

              {/* Link */}
              {feature.link && (
                <a
                  href={feature.link}
                  className="inline-flex items-center mt-4 text-[var(--electric-cyan)] hover:text-[var(--deep-indigo)] font-medium transition-colors"
                >
                  Learn more
                  <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
