/**
 * Page Header Component
 *
 * Standard page header with title, description, and optional breadcrumbs
 */

import { DynamicComponentProps } from '@/lib/component-loader'

export default function PageHeader({ spec }: DynamicComponentProps) {
  const { props, content } = spec

  return (
    <header className="page-header mb-8">
      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
        {props.title || content?.title || 'Page Title'}
      </h1>

      {/* Description */}
      {(props.description || content?.description) && (
        <p className="text-lg text-gray-600 max-w-3xl">
          {props.description || content?.description}
        </p>
      )}

      {/* Tags/Categories */}
      {(props.tags || content?.tags) && (
        <div className="flex flex-wrap gap-2 mt-4">
          {(Array.isArray(props.tags) ? props.tags : props.tags?.split(',') || content?.tags || []).map((tag: string, index: number) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
            >
              {tag.trim()}
            </span>
          ))}
        </div>
      )}
    </header>
  )
}
