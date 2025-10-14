/**
 * Providers Component
 *
 * Wraps the app with necessary context providers
 */

'use client'

import React from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="dynamic-website-theme">
      {children}
    </ThemeProvider>
  )
}
