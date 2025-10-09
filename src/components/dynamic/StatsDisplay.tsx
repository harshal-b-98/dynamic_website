/**
 * Stats Display Component
 *
 * Prominent statistics display for showcasing key numbers
 */

import { DynamicComponentProps } from '@/lib/component-loader'

interface Stat {
  value: string | number
  label: string
  suffix?: string
  prefix?: string
}

export default function StatsDisplay({ spec }: DynamicComponentProps) {
  const { props, content, styling } = spec
  const stats: Stat[] = props.stats || content?.stats || []
  const theme = styling?.theme || 'light'

  const themeClasses = {
    light: 'bg-gray-50',
    dark: 'bg-gray-900 text-white',
    brand: 'bg-gradient-to-br from-[var(--deep-indigo)] to-blue-900 text-white'
  }

  return (
    <div className={`stats-display ${themeClasses[theme]} -mx-4 px-4 md:-mx-8 md:px-8 py-12 rounded-lg`}>
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        {(props.title || content?.title) && (
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            {props.title || content?.title}
          </h2>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {stat.prefix}
                {stat.value}
                {stat.suffix}
              </div>
              <div className={`text-sm md:text-base ${theme === 'light' ? 'text-gray-600' : 'opacity-80'}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
