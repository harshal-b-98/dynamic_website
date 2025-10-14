/**
 * ProgressBar Component (Molecule)
 *
 * Progress indicator with label, percentage, and variants
 */

'use client'

import React from 'react'

export interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  showValue?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'gradient'
  animated?: boolean
  striped?: boolean
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = false,
  showValue = false,
  size = 'md',
  variant = 'default',
  animated = false,
  striped = false,
  className = ''
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  const variantClasses = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
    error: 'bg-red-600',
    info: 'bg-cyan-600',
    gradient: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
  }

  const getVariantColor = (): string => {
    if (variant !== 'default') {
      return variantClasses[variant]
    }

    // Auto color based on percentage
    if (percentage >= 75) return variantClasses.success
    if (percentage >= 50) return variantClasses.info
    if (percentage >= 25) return variantClasses.warning
    return variantClasses.error
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      {(label || showPercentage || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {label}
            </span>
          )}
          {(showPercentage || showValue) && (
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {showValue && `${value}/${max}`}
              {showValue && showPercentage && ' • '}
              {showPercentage && `${Math.round(percentage)}%`}
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div
        className={`
          w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden
          ${sizeClasses[size]}
        `}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
      >
        <div
          className={`
            h-full rounded-full transition-all duration-300 ease-out
            ${getVariantColor()}
            ${striped ? 'bg-stripe' : ''}
            ${animated ? 'animate-progress' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Optional inline percentage */}
      {size === 'lg' && showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  )
}

ProgressBar.displayName = 'ProgressBar'
