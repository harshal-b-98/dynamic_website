/**
 * Pagination Component (Molecule)
 *
 * Accessible pagination with page numbers and navigation
 */

'use client'

import React from 'react'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  showPrevNext?: boolean
  maxVisiblePages?: number
  className?: string
  disabled?: boolean
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  className = '',
  disabled = false
}) => {
  const getVisiblePages = (): (number | string)[] => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: (number | string)[] = []
    const halfVisible = Math.floor(maxVisiblePages / 2)
    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, currentPage + halfVisible)

    if (currentPage <= halfVisible) {
      endPage = maxVisiblePages
    } else if (currentPage >= totalPages - halfVisible) {
      startPage = totalPages - maxVisiblePages + 1
    }

    if (startPage > 1) {
      pages.push(1)
      if (startPage > 2) pages.push('...')
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  const handlePageClick = (page: number) => {
    if (disabled || page === currentPage || page < 1 || page > totalPages) return
    onPageChange(page)
  }

  const visiblePages = getVisiblePages()

  const buttonBaseClass = `
    px-3 py-2 text-sm font-medium rounded-md
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  `

  const activeClass = 'bg-blue-600 text-white'
  const inactiveClass = `
    bg-white dark:bg-gray-800
    text-gray-700 dark:text-gray-300
    border border-gray-300 dark:border-gray-600
    hover:bg-gray-50 dark:hover:bg-gray-700
  `
  const disabledClass = 'opacity-50 cursor-not-allowed'

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-center gap-1 ${className}`}
    >
      {/* First page */}
      {showFirstLast && (
        <button
          onClick={() => handlePageClick(1)}
          disabled={disabled || currentPage === 1}
          aria-label="Go to first page"
          className={`
            ${buttonBaseClass}
            ${currentPage === 1 || disabled ? disabledClass : inactiveClass}
          `}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Previous page */}
      {showPrevNext && (
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          aria-label="Go to previous page"
          className={`
            ${buttonBaseClass}
            ${currentPage === 1 || disabled ? disabledClass : inactiveClass}
          `}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Page numbers */}
      {visiblePages.map((page, index) => (
        <React.Fragment key={index}>
          {typeof page === 'number' ? (
            <button
              onClick={() => handlePageClick(page)}
              disabled={disabled}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
              className={`
                ${buttonBaseClass}
                ${page === currentPage ? activeClass : inactiveClass}
                ${disabled && page !== currentPage ? disabledClass : ''}
              `}
            >
              {page}
            </button>
          ) : (
            <span className="px-2 text-gray-500 dark:text-gray-400">
              {page}
            </span>
          )}
        </React.Fragment>
      ))}

      {/* Next page */}
      {showPrevNext && (
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          aria-label="Go to next page"
          className={`
            ${buttonBaseClass}
            ${currentPage === totalPages || disabled ? disabledClass : inactiveClass}
          `}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Last page */}
      {showFirstLast && (
        <button
          onClick={() => handlePageClick(totalPages)}
          disabled={disabled || currentPage === totalPages}
          aria-label="Go to last page"
          className={`
            ${buttonBaseClass}
            ${currentPage === totalPages || disabled ? disabledClass : inactiveClass}
          `}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </nav>
  )
}

Pagination.displayName = 'Pagination'
