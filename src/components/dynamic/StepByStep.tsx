/**
 * Step By Step Component
 *
 * Sequential step-by-step instructions or process flow
 */

import { DynamicComponentProps } from '@/lib/component-loader'

interface Step {
  title: string
  description: string
  image?: string
}

export default function StepByStep({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  const steps: Step[] = props.steps || content?.steps || []

  return (
    <div className="step-by-step max-w-4xl mx-auto">
      {/* Section Header */}
      {(props.title || content?.title) && (
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-12 text-center">
          {props.title || content?.title}
        </h2>
      )}

      {/* Steps */}
      <div className="space-y-8">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-6">
            {/* Step Number */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center">
                {index + 1}
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 pt-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {step.description}
              </p>
              {step.image && (
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full rounded-lg border border-gray-200"
                />
              )}
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="absolute left-6 top-16 w-0.5 h-full bg-gray-200 -ml-px"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
