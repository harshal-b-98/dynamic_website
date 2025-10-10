'use client'

/**
 * Thinking Overlay Component
 *
 * Full-page overlay that displays the AI thinking process prominently
 * Appears on top of all content when a page is being generated
 */

import React from 'react'
import LinearThinkingProcess from './LinearThinkingProcess'
import { ThinkingStage } from '@/lib/thinking-process'

interface ThinkingOverlayProps {
  isVisible: boolean
  stages: ThinkingStage[]  // Receive real stages from stream
  onCancel?: () => void
}

export default function ThinkingOverlay({ isVisible, stages, onCancel }: ThinkingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--deep-indigo)]/95 via-[var(--deep-indigo)]/90 to-black/95 backdrop-blur-sm">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--electric-cyan)] rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--electric-cyan)] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--electric-cyan)] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center py-12">
        <LinearThinkingProcess
          isVisible={isVisible}
          stages={stages}
          onCancel={onCancel}
        />
      </div>

      {/* Footer Tip */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-20">
        <p className="text-[var(--light-data-gray)] font-inter text-sm">
          ✨ Each page is uniquely generated based on your question
        </p>
      </div>
    </div>
  )
}
