/**
 * Metric Card Component
 *
 * Display key metrics using shadcn/ui Card
 */

import { DynamicComponentProps } from '@/lib/component-loader'
import { Card, CardContent } from '@/components/ui/card'

interface Metric {
  value: string | number
  label: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon?: string
}

export default function MetricCard({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  const metrics: Metric[] = props.metrics || content?.metrics || []

  return (
    <div className="metric-card">
      {/* Section Header */}
      {(props.title || content?.title) && (
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {props.title || content?.title}
        </h3>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              {/* Icon */}
              {metric.icon && (
                <div className="mb-3">
                  <span className="text-2xl">{metric.icon}</span>
                </div>
              )}

              {/* Value */}
              <div className="text-3xl font-bold mb-1">
                {metric.value}
              </div>

              {/* Label */}
              <div className="text-sm text-muted-foreground mb-2">
                {metric.label}
              </div>

              {/* Trend */}
              {metric.trend && (
                <div className="flex items-center gap-1 text-sm">
                  {metric.trend === 'up' && (
                    <span className="text-green-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      {metric.trendValue}
                    </span>
                  )}
                  {metric.trend === 'down' && (
                    <span className="text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {metric.trendValue}
                    </span>
                  )}
                  {metric.trend === 'neutral' && (
                    <span className="text-muted-foreground">
                      {metric.trendValue}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
