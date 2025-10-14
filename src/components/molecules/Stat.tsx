/**
 * Stat Component (Molecule)
 *
 * Statistical display with label, value, and trend indicator
 */

'use client'

import React from 'react'

export interface StatProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    label?: string
  }
  prefix?: string
  suffix?: string
  description?: string
  variant?: 'default' | 'card'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  icon,
  trend,
  prefix = '',
  suffix = '',
  description,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: {
      value: 'text-2xl',
      label: 'text-xs',
      description: 'text-xs',
      trend: 'text-xs',
      icon: 'w-8 h-8',
      padding: 'p-3'
    },
    md: {
      value: 'text-3xl',
      label: 'text-sm',
      description: 'text-sm',
      trend: 'text-sm',
      icon: 'w-10 h-10',
      padding: 'p-4'
    },
    lg: {
      value: 'text-4xl',
      label: 'text-base',
      description: 'text-base',
      trend: 'text-base',
      icon: 'w-12 h-12',
      padding: 'p-6'
    }
  }

  const getTrendColor = (direction: 'up' | 'down' | 'neutral'): string => {
    switch (direction) {
      case 'up':
        return 'text-green-600 dark:text-green-400'
      case 'down':
        return 'text-red-600 dark:text-red-400'
      case 'neutral':
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral'): React.ReactNode => {
    if (direction === 'up') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    }
    if (direction === 'down') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      )
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    )
  }

  const containerClasses = variant === 'card'
    ? `bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${sizeClasses[size].padding}`
    : ''

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className={`${sizeClasses[size].label} font-medium text-gray-600 dark:text-gray-400 mb-1`}>
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            {prefix && (
              <span className={`${sizeClasses[size].value} font-bold text-gray-900 dark:text-gray-100`}>
                {prefix}
              </span>
            )}
            <span className={`${sizeClasses[size].value} font-bold text-gray-900 dark:text-gray-100`}>
              {value}
            </span>
            {suffix && (
              <span className={`${sizeClasses[size].label} font-medium text-gray-600 dark:text-gray-400`}>
                {suffix}
              </span>
            )}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 ${sizeClasses[size].trend} font-medium ${getTrendColor(trend.direction)}`}>
              {getTrendIcon(trend.direction)}
              <span>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              {trend.label && (
                <span className="text-gray-500 dark:text-gray-500">
                  {trend.label}
                </span>
              )}
            </div>
          )}
          {description && (
            <p className={`${sizeClasses[size].description} text-gray-500 dark:text-gray-500 mt-2`}>
              {description}
            </p>
          )}
        </div>
        {icon && (
          <div className={`flex-shrink-0 ${sizeClasses[size].icon} text-blue-600 dark:text-blue-400`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

Stat.displayName = 'Stat'
