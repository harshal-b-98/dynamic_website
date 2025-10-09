/**
 * Testimonial Block Component
 *
 * Customer testimonials with quote, author, and company info
 */

import { DynamicComponentProps } from '@/lib/component-loader'

interface Testimonial {
  quote: string
  author: string
  role?: string
  company?: string
  avatarUrl?: string
  rating?: number
}

export default function TestimonialBlock({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  const testimonials: Testimonial[] = props.testimonials || content?.testimonials || []

  return (
    <div className="testimonial-block">
      {/* Section Header */}
      {(props.title || content?.title) && (
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-12 text-center">
          {props.title || content?.title}
        </h2>
      )}

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="testimonial-card p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
          >
            {/* Rating */}
            {testimonial.rating && (
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonial.rating! ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            )}

            {/* Quote */}
            <blockquote className="text-gray-700 mb-6 leading-relaxed">
              "{testimonial.quote}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center gap-3">
              {testimonial.avatarUrl ? (
                <img
                  src={testimonial.avatarUrl}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">
                    {testimonial.author.charAt(0)}
                  </span>
                </div>
              )}

              <div>
                <div className="font-semibold text-gray-900">
                  {testimonial.author}
                </div>
                {(testimonial.role || testimonial.company) && (
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                    {testimonial.role && testimonial.company && ', '}
                    {testimonial.company}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
