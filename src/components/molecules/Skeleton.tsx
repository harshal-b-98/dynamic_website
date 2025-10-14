/**
 * Skeleton Component (Molecule)
 *
 * Loading placeholder with various shapes and animations
 */

'use client'

import React from 'react'

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  lines?: number
  animated?: boolean
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  animated = true,
  className = ''
}) => {
  const getVariantClasses = (): string => {
    switch (variant) {
      case 'circular':
        return 'rounded-full'
      case 'rectangular':
        return 'rounded-none'
      case 'rounded':
        return 'rounded-lg'
      case 'text':
      default:
        return 'rounded'
    }
  }

  const getDefaultSize = (): { width: string | number; height: string | number } => {
    switch (variant) {
      case 'circular':
        return { width: width || '40px', height: height || '40px' }
      case 'text':
        return { width: width || '100%', height: height || '1em' }
      default:
        return { width: width || '100%', height: height || '100px' }
    }
  }

  const { width: defaultWidth, height: defaultHeight } = getDefaultSize()

  const style: React.CSSProperties = {
    width: width || defaultWidth,
    height: height || defaultHeight
  }

  const baseClasses = `
    bg-gray-200 dark:bg-gray-700
    ${getVariantClasses()}
    ${animated ? 'animate-pulse' : ''}
  `

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={baseClasses}
            style={{
              ...style,
              width: index === lines - 1 ? '80%' : style.width
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`${baseClasses} ${className}`}
      style={style}
    />
  )
}

Skeleton.displayName = 'Skeleton'

/**
 * Skeleton Group for common loading patterns
 */
export interface SkeletonGroupProps {
  variant: 'card' | 'list' | 'profile' | 'article' | 'table'
  count?: number
  animated?: boolean
  className?: string
}

export const SkeletonGroup: React.FC<SkeletonGroupProps> = ({
  variant,
  count = 1,
  animated = true,
  className = ''
}) => {
  const renderCard = () => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
      <Skeleton variant="rectangular" height="200px" animated={animated} />
      <Skeleton variant="text" width="60%" animated={animated} />
      <Skeleton variant="text" lines={2} animated={animated} />
    </div>
  )

  const renderList = () => (
    <div className="flex items-center gap-3 py-3">
      <Skeleton variant="circular" width="40px" height="40px" animated={animated} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="40%" animated={animated} />
        <Skeleton variant="text" width="80%" animated={animated} />
      </div>
    </div>
  )

  const renderProfile = () => (
    <div className="flex items-start gap-4">
      <Skeleton variant="circular" width="80px" height="80px" animated={animated} />
      <div className="flex-1 space-y-3">
        <Skeleton variant="text" width="50%" height="24px" animated={animated} />
        <Skeleton variant="text" lines={3} animated={animated} />
        <div className="flex gap-2 mt-4">
          <Skeleton variant="rounded" width="100px" height="36px" animated={animated} />
          <Skeleton variant="rounded" width="100px" height="36px" animated={animated} />
        </div>
      </div>
    </div>
  )

  const renderArticle = () => (
    <div className="space-y-4">
      <Skeleton variant="text" width="70%" height="32px" animated={animated} />
      <Skeleton variant="text" width="40%" height="16px" animated={animated} />
      <Skeleton variant="rectangular" height="300px" animated={animated} className="my-6" />
      <Skeleton variant="text" lines={5} animated={animated} />
    </div>
  )

  const renderTable = () => (
    <div className="space-y-2">
      <div className="flex gap-4 pb-2 border-b border-gray-200 dark:border-gray-700">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="text" width="25%" height="20px" animated={animated} />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-3">
          {Array.from({ length: 4 }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width="25%" animated={animated} />
          ))}
        </div>
      ))}
    </div>
  )

  const renderVariant = () => {
    switch (variant) {
      case 'card':
        return renderCard()
      case 'list':
        return renderList()
      case 'profile':
        return renderProfile()
      case 'article':
        return renderArticle()
      case 'table':
        return renderTable()
    }
  }

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={index > 0 ? 'mt-4' : ''}>
          {renderVariant()}
        </div>
      ))}
    </div>
  )
}

SkeletonGroup.displayName = 'SkeletonGroup'
