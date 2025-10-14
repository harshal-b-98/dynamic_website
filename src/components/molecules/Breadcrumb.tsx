/**
 * Breadcrumb Component (Molecule)
 *
 * Navigation breadcrumb trail
 */

'use client'

import React from 'react'
import Link from 'next/link'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  className?: string
  homeIcon?: React.ReactNode
  maxItems?: number
  showHome?: boolean
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator,
  className = '',
  homeIcon,
  maxItems,
  showHome = true
}) => {
  const defaultSeparator = (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )

  const defaultHomeIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )

  const sep = separator || defaultSeparator

  // Handle collapsed items if maxItems is set
  const getVisibleItems = (): BreadcrumbItem[] => {
    if (!maxItems || items.length <= maxItems) {
      return items
    }

    // Show first item, ellipsis, and last (maxItems - 2) items
    const firstItem = items[0]
    const lastItems = items.slice(-(maxItems - 2))
    const collapsedItem: BreadcrumbItem = { label: '...' }

    return [firstItem, collapsedItem, ...lastItems]
  }

  const visibleItems = getVisibleItems()

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-sm ${className}`}
    >
      <ol className="flex items-center gap-2 flex-wrap">
        {showHome && visibleItems[0] && (
          <li className="flex items-center gap-2">
            {visibleItems[0].href ? (
              <Link
                href={visibleItems[0].href}
                className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                {homeIcon || defaultHomeIcon}
                <span className="sr-only">{visibleItems[0].label}</span>
              </Link>
            ) : (
              <span className="flex items-center gap-1.5 text-gray-900 dark:text-gray-100">
                {homeIcon || defaultHomeIcon}
                <span className="sr-only">{visibleItems[0].label}</span>
              </span>
            )}
            {visibleItems.length > 1 && (
              <span aria-hidden="true">{sep}</span>
            )}
          </li>
        )}

        {visibleItems.slice(showHome ? 1 : 0).map((item, index) => {
          const isLast = index === visibleItems.slice(showHome ? 1 : 0).length - 1
          const isEllipsis = item.label === '...'

          return (
            <li key={index} className="flex items-center gap-2">
              {isEllipsis ? (
                <span className="text-gray-500 dark:text-gray-400">
                  {item.label}
                </span>
              ) : item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span className="truncate max-w-[200px]">{item.label}</span>
                </Link>
              ) : (
                <span
                  className="flex items-center gap-1.5 text-gray-900 dark:text-gray-100 font-medium"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span className="truncate max-w-[200px]">{item.label}</span>
                </span>
              )}
              {!isLast && (
                <span aria-hidden="true">{sep}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

Breadcrumb.displayName = 'Breadcrumb'
