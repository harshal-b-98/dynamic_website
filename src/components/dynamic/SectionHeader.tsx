/**
 * Section Header Component
 *
 * Section header with title and optional description
 */

import { DynamicComponentProps } from '@/lib/component-loader'

export default function SectionHeader({ spec }: DynamicComponentProps) {
  const { props, content } = spec

  return (
    <div className="section-header text-center mb-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
        {props.title || content?.title || 'Section Title'}
      </h2>

      {(props.description || content?.description) && (
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {props.description || content?.description}
        </p>
      )}
    </div>
  )
}
