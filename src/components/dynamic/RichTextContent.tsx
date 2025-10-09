/**
 * Rich Text Content Component
 *
 * Renders formatted text content with markdown-style support
 */

import { DynamicComponentProps } from '@/lib/component-loader'

export default function RichTextContent({ spec }: DynamicComponentProps) {
  const { props, content } = spec

  const textContent = props.content || content?.content || ''

  // Simple markdown-like parsing
  const renderContent = (text: string) => {
    // Split by paragraphs
    const paragraphs = text.split('\n\n')

    return paragraphs.map((paragraph, index) => {
      // Check for headers
      if (paragraph.startsWith('### ')) {
        return (
          <h3 key={index} className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            {paragraph.replace('### ', '')}
          </h3>
        )
      }

      if (paragraph.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            {paragraph.replace('## ', '')}
          </h2>
        )
      }

      if (paragraph.startsWith('# ')) {
        return (
          <h1 key={index} className="text-3xl font-bold text-gray-900 mt-10 mb-5">
            {paragraph.replace('# ', '')}
          </h1>
        )
      }

      // Check for lists
      if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
        const items = paragraph.split('\n').filter(line => line.trim())
        return (
          <ul key={index} className="list-disc list-inside space-y-2 my-4 text-gray-700">
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^[-*]\s/, '')}</li>
            ))}
          </ul>
        )
      }

      if (/^\d+\.\s/.test(paragraph)) {
        const items = paragraph.split('\n').filter(line => line.trim())
        return (
          <ol key={index} className="list-decimal list-inside space-y-2 my-4 text-gray-700">
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^\d+\.\s/, '')}</li>
            ))}
          </ol>
        )
      }

      // Regular paragraph
      return (
        <p key={index} className="text-gray-700 leading-relaxed my-4">
          {paragraph}
        </p>
      )
    })
  }

  return (
    <div className="rich-text-content prose prose-lg max-w-none">
      {renderContent(textContent)}
    </div>
  )
}
