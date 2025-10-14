/**
 * Theme Context
 *
 * Provides theme state and switching functionality
 */

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const THEME_STORAGE_KEY = 'theme-preference'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  storageKey = THEME_STORAGE_KEY
}) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')
  const [mounted, setMounted] = useState(false)

  // Get system theme preference
  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // Resolve theme (handles 'system' option)
  const resolveTheme = (themeValue: Theme): ResolvedTheme => {
    if (themeValue === 'system') {
      return getSystemTheme()
    }
    return themeValue
  }

  // Apply theme to document
  const applyTheme = (themeValue: Theme) => {
    const resolved = resolveTheme(themeValue)
    setResolvedTheme(resolved)

    // Update document class
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolved)

    // Update data attribute for CSS selectors
    root.setAttribute('data-theme', resolved)

    // Apply CSS custom properties
    const tokens = resolved === 'dark'
      ? require('../lib/design-tokens').cssVariables.dark
      : require('../lib/design-tokens').cssVariables.light

    Object.entries(tokens).forEach(([key, value]) => {
      root.style.setProperty(key, value as string)
    })
  }

  // Set theme and persist to storage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem(storageKey, newTheme)
    } catch (e) {
      console.error('Failed to save theme preference:', e)
    }
    applyTheme(newTheme)
  }

  // Initialize theme from storage or default
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null
      const initialTheme = stored || defaultTheme
      setThemeState(initialTheme)
      applyTheme(initialTheme)
    } catch (e) {
      console.error('Failed to load theme preference:', e)
      applyTheme(defaultTheme)
    }
    setMounted(true)
  }, [defaultTheme, storageKey])

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      applyTheme('system')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // Prevent flash of wrong theme
  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to access theme context
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
