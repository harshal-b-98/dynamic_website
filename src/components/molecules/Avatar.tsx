/**
 * Avatar Component (Molecule)
 *
 * User avatar with image, initials fallback, status indicator
 */

'use client'

import React, { useState } from 'react'

export interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  shape?: 'circle' | 'square'
  status?: 'online' | 'offline' | 'away' | 'busy'
  showStatus?: boolean
  className?: string
  onClick?: () => void
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  status,
  showStatus = false,
  className = '',
  onClick
}) => {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-3xl'
  }

  const statusSizeClasses = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5'
  }

  const statusColorClasses = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500'
  }

  const shapeClasses = shape === 'circle' ? 'rounded-full' : 'rounded-lg'

  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const showImage = src && !imageError
  const showInitials = !showImage && name

  return (
    <div
      className={`relative inline-flex ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div
        className={`
          ${sizeClasses[size]} ${shapeClasses}
          flex items-center justify-center
          overflow-hidden
          ${showImage ? '' : 'bg-gradient-to-br from-blue-500 to-purple-600'}
          ring-2 ring-white dark:ring-gray-800
        `}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : showInitials ? (
          <span className="font-semibold text-white select-none">
            {getInitials(name)}
          </span>
        ) : (
          <svg
            className="w-full h-full text-gray-300 dark:text-gray-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </div>

      {/* Status indicator */}
      {showStatus && status && (
        <span
          className={`
            absolute bottom-0 right-0
            ${statusSizeClasses[size]}
            ${statusColorClasses[status]}
            ${shape === 'circle' ? 'rounded-full' : 'rounded'}
            ring-2 ring-white dark:ring-gray-800
          `}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  )
}

Avatar.displayName = 'Avatar'
