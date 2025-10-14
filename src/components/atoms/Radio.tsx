/**
 * Radio Component (Atom)
 *
 * Accessible radio button with label support
 */

'use client'

import React from 'react'

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  helperText?: string
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const radioId = id || `radio-${React.useId()}`

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={radioId}
            type="radio"
            className={`
              w-4 h-4 rounded-full border-gray-300
              text-blue-600
              focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:cursor-not-allowed disabled:opacity-50
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${radioId}-error` : helperText ? `${radioId}-helper` : undefined
            }
            {...props}
          />
        </div>
        {label && (
          <div className="ml-3 text-sm">
            <label htmlFor={radioId} className="font-medium text-gray-900 dark:text-gray-100">
              {label}
            </label>
            {helperText && !error && (
              <p id={`${radioId}-helper`} className="text-gray-500 dark:text-gray-400">
                {helperText}
              </p>
            )}
            {error && (
              <p id={`${radioId}-error`} className="text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Radio.displayName = 'Radio'
