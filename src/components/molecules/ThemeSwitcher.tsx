/**
 * ThemeSwitcher Component (Molecule)
 *
 * UI control for switching between light, dark, and system themes
 */

'use client'

import React from 'react'
import { useTheme, type Theme } from '@/contexts/ThemeContext'

export interface ThemeSwitcherProps {
  variant?: 'dropdown' | 'toggle' | 'buttons'
  showLabels?: boolean
  className?: string
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'toggle',
  showLabels = false,
  className = ''
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme()

  if (variant === 'toggle') {
    return (
      <button
        onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
        className={`
          p-2 rounded-lg transition-colors
          bg-gray-100 dark:bg-gray-800
          hover:bg-gray-200 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${className}
        `}
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'light' ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </button>
    )
  }

  if (variant === 'buttons') {
    const themes: { value: Theme; icon: React.ReactNode; label: string }[] = [
      {
        value: 'light',
        label: 'Light',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
      },
      {
        value: 'dark',
        label: 'Dark',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ),
      },
      {
        value: 'system',
        label: 'System',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
      },
    ]

    return (
      <div className={`inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 ${className}`}>
        {themes.map(({ value, icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`
              inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
              ${theme === value
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }
            `}
            aria-label={`${label} theme`}
            aria-pressed={theme === value}
          >
            {icon}
            {showLabels && <span>{label}</span>}
          </button>
        ))}
      </div>
    )
  }

  // Dropdown variant
  return (
    <div className={`relative ${className}`}>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
        className="
          appearance-none px-3 py-2 pr-8 rounded-lg text-sm font-medium
          bg-gray-100 dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          border border-gray-300 dark:border-gray-600
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          cursor-pointer
        "
        aria-label="Select theme"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600 dark:text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

ThemeSwitcher.displayName = 'ThemeSwitcher'
