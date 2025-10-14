/**
 * FormField Component (Molecule)
 *
 * Composite field with label, input, and error message
 * Supports text, email, password, number, tel, url
 */

'use client'

import React from 'react'

export interface FormFieldProps {
  label: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  name: string
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  placeholder?: string
  error?: string
  helperText?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  autoComplete?: string
  autoFocus?: boolean
  className?: string
  inputClassName?: string
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      type = 'text',
      name,
      value,
      onChange,
      onBlur,
      placeholder,
      error,
      helperText,
      required = false,
      disabled = false,
      readOnly = false,
      autoComplete,
      autoFocus = false,
      className = '',
      inputClassName = ''
    },
    ref
  ) => {
    const fieldId = `field-${name}`

    return (
      <div className={`w-full ${className}`}>
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          ref={ref}
          id={fieldId}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined}
          className={`
            w-full px-3 py-2 border rounded-lg
            text-gray-900 dark:text-gray-100
            bg-white dark:bg-gray-800
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-900
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}
            ${inputClassName}
          `}
        />
        {helperText && !error && (
          <p id={`${fieldId}-helper`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
        {error && (
          <p id={`${fieldId}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'
