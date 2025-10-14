/**
 * Switch Component (Atom)
 *
 * Toggle switch with label support
 */

'use client'

import React from 'react'

export interface SwitchProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
  helperText?: string
  error?: string
  id?: string
  name?: string
  className?: string
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    { checked = false, onChange, disabled = false, label, helperText, error, id, name, className = '' },
    ref
  ) => {
    const switchId = id || `switch-${React.useId()}`

    const handleToggle = () => {
      if (!disabled && onChange) {
        onChange(!checked)
      }
    }

    return (
      <div className="flex items-center justify-between">
        {label && (
          <div className="flex-1 mr-4">
            <label htmlFor={switchId} className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {label}
            </label>
            {helperText && !error && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
            )}
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          </div>
        )}
        <button
          ref={ref}
          type="button"
          role="switch"
          id={switchId}
          name={name}
          aria-checked={checked}
          disabled={disabled}
          onClick={handleToggle}
          className={`
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
            border-2 border-transparent transition-colors duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
            ${className}
          `}
        >
          <span className="sr-only">{label || 'Toggle switch'}</span>
          <span
            aria-hidden="true"
            className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full
              bg-white shadow ring-0 transition duration-200 ease-in-out
              ${checked ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>
    )
  }
)

Switch.displayName = 'Switch'
