/**
 * Tag Component (Molecule)
 *
 * Labeled badge with optional close button
 */

'use client'

import React from 'react'

export interface TagProps {
  label: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  removable?: boolean
  onRemove?: () => void
  icon?: React.ReactNode
  className?: string
}

export const Tag: React.FC<TagProps> = ({
  label,
  variant = 'default',
  size = 'md',
  removable = false,
  onRemove,
  icon,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2'
  }

  const variantClasses = {
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600',
    primary: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
    success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700',
    warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
    error: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700',
    info: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 border-cyan-300 dark:border-cyan-700'
  }

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {icon && (
        <span className={`flex-shrink-0 ${iconSizeClasses[size]}`}>
          {icon}
        </span>
      )}
      <span className="truncate">{label}</span>
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className={`
            flex-shrink-0 ml-0.5 rounded-full
            hover:bg-black hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-10
            focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current
            transition-colors
            ${iconSizeClasses[size]}
          `}
          aria-label={`Remove ${label}`}
        >
          <svg
            className="w-full h-full"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  )
}

Tag.displayName = 'Tag'
