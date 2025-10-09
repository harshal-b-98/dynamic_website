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
      <div className={`grid ${gridClass} gap-8`}>
        {features.map((feature, index) => (
          <div
            key={index}
            className="feature-card p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
          >
            {/* Icon */}
            {feature.icon && (
              <div className="mb-4">
                {feature.icon.startsWith('http') ? (
                  <img src={feature.icon} alt="" className="w-12 h-12" />
                ) : (
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                )}
              </div>
            )}

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">
              {feature.description}
            </p>

            {/* Link */}
            {feature.link && (
              <a
                href={feature.link}
                className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Learn more
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
