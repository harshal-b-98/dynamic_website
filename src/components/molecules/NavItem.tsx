/**
 * NavItem Component (Molecule)
 *
 * Navigation item with active state, icon, and badge
 */

'use client'

import React from 'react'
import Link from 'next/link'

export interface NavItemProps {
  label: string
  href?: string
  icon?: React.ReactNode
  badge?: string | number
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
  variant?: 'horizontal' | 'vertical'
}

export const NavItem: React.FC<NavItemProps> = ({
  label,
  href,
  icon,
  badge,
  active = false,
  disabled = false,
  onClick,
  className = '',
  variant = 'horizontal'
}) => {
  const baseClasses = `
    inline-flex items-center gap-2
    font-medium transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    rounded-md
  `

  const variantClasses = {
    horizontal: 'px-3 py-2 text-sm',
    vertical: 'px-4 py-3 text-base w-full'
  }

  const stateClasses = disabled
    ? 'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-600'
    : active
    ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${stateClasses} ${className}`

  const content = (
    <>
      {icon && (
        <span className="flex-shrink-0 w-5 h-5">
          {icon}
        </span>
      )}
      <span className={variant === 'vertical' ? 'flex-1 text-left' : ''}>
        {label}
      </span>
      {badge !== undefined && (
        <span
          className={`
            inline-flex items-center justify-center
            min-w-[20px] h-5 px-1.5
            text-xs font-semibold rounded-full
            ${active
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }
          `}
        >
          {badge}
        </span>
      )}
    </>
  )

  if (disabled) {
    return (
      <span className={combinedClasses} aria-disabled="true">
        {content}
      </span>
    )
  }

  if (href) {
    return (
      <Link
        href={href}
        className={combinedClasses}
        aria-current={active ? 'page' : undefined}
        onClick={onClick}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      className={combinedClasses}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
    >
      {content}
    </button>
  )
}

NavItem.displayName = 'NavItem'
