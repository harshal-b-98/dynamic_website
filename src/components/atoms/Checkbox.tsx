/**
 * Checkbox Component (Atom)
 *
 * Accessible checkbox with label support
 */

'use client'

import React from 'react'

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  helperText?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${React.useId()}`

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={`
              w-4 h-4 rounded border-gray-300
              text-blue-600
              focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:cursor-not-allowed disabled:opacity-50
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${checkboxId}-error` : helperText ? `${checkboxId}-helper` : undefined
            }
            {...props}
          />
        </div>
        {label && (
          <div className="ml-3 text-sm">
            <label htmlFor={checkboxId} className="font-medium text-gray-900 dark:text-gray-100">
              {label}
            </label>
            {helperText && !error && (
              <p id={`${checkboxId}-helper`} className="text-gray-500 dark:text-gray-400">
                {helperText}
              </p>
            )}
            {error && (
              <p id={`${checkboxId}-error`} className="text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
