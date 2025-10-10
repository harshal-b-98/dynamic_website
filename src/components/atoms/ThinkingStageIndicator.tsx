/**
 * Enhanced Thinking Stage Indicator Component
 *
 * Displays a single stage in the AI thinking process with creative animations,
 * circular progress ring, and visual feedback for each status.
 */

import { ThinkingStage } from '@/lib/thinking-process'

interface ThinkingStageIndicatorProps {
  stage: ThinkingStage
  isActive: boolean
  stageIndex: number
}

export default function ThinkingStageIndicator({ stage, isActive, stageIndex }: ThinkingStageIndicatorProps) {
  const { status, name, message, duration, progress } = stage

  // Status icon with SVG animations
  const getStatusIcon = () => {
    switch (status) {
      case 'complete':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'active':
        return (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )
      case 'error':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )
      default:
        return <span className="text-sm font-bold">{stageIndex + 1}</span>
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'complete':
        return 'bg-gradient-to-br from-[var(--data-green)] to-green-600 text-white shadow-lg shadow-green-500/50'
      case 'active':
        return 'bg-gradient-to-br from-[var(--electric-cyan)] to-cyan-400 text-[var(--deep-indigo)] shadow-lg shadow-cyan-500/50'
      case 'error':
        return 'bg-gradient-to-br from-[var(--risk-red)] to-red-600 text-white shadow-lg shadow-red-500/50'
      default:
        return 'bg-gray-300 text-gray-600'
    }
  }

  const getBackgroundColor = () => {
    switch (status) {
      case 'complete':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-[var(--data-green)]'
      case 'active':
        return 'bg-gradient-to-r from-cyan-50 to-blue-50 border-l-4 border-[var(--electric-cyan)] ring-2 ring-[var(--electric-cyan)]/30'
      case 'error':
        return 'bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-[var(--risk-red)]'
      default:
        return 'bg-gray-50/50 border-l-4 border-gray-300'
    }
  }

  // Calculate circular progress
  const circularProgress = progress !== undefined ? progress * 100 : 0
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (circularProgress / 100) * circumference

  return (
    <div
      className={`
        flex items-start gap-4 p-4 rounded-xl transition-all duration-500 ease-out
        ${getBackgroundColor()}
        ${isActive ? 'scale-[1.02] shadow-xl transform translate-x-1' : 'opacity-80'}
        ${status === 'complete' ? 'opacity-90' : ''}
      `}
      style={{
        transitionDelay: `${stageIndex * 50}ms`,
      }}
    >
      {/* Status Icon with Circular Progress */}
      <div className="relative flex-shrink-0">
        <div
          className={`
            w-14 h-14 rounded-full flex items-center justify-center
            font-bold transition-all duration-500
            ${getStatusColor()}
            ${status === 'active' ? 'animate-pulse' : ''}
          `}
          aria-label={`${name} status: ${status}`}
        >
          {getStatusIcon()}
        </div>

        {/* Circular Progress Ring (for active stage) */}
        {status === 'active' && progress !== undefined && (
          <svg className="absolute top-0 left-0 w-14 h-14 -rotate-90" viewBox="0 0 40 40">
            <circle
              cx="20"
              cy="20"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              opacity="0.2"
              className="text-[var(--electric-cyan)]"
            />
            <circle
              cx="20"
              cy="20"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-[var(--electric-cyan)] transition-all duration-300"
            />
          </svg>
        )}

        {/* Completion pulse */}
        {status === 'complete' && (
          <div className="absolute inset-0 rounded-full bg-[var(--data-green)] opacity-20 animate-ping"></div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-mont font-bold text-lg text-[var(--deep-indigo)] flex items-center gap-2">
            {name}
            {status === 'complete' && (
              <span className="inline-flex items-center justify-center w-5 h-5 bg-[var(--data-green)] text-white rounded-full text-xs animate-scale-in">
                ✓
              </span>
            )}
          </h3>
          {duration !== undefined && duration > 0 && status === 'complete' && (
            <span className="text-xs text-[var(--data-green)] font-inter font-semibold bg-green-100 px-2.5 py-1 rounded-full">
              {(duration / 1000).toFixed(1)}s
            </span>
          )}
          {status === 'active' && progress !== undefined && (
            <span className="text-xs text-[var(--electric-cyan)] font-inter font-bold bg-cyan-100 px-2.5 py-1 rounded-full animate-pulse">
              {Math.round(progress * 100)}%
            </span>
          )}
        </div>

        <p className="text-sm text-[var(--charcoal-gray)] font-inter mb-3 leading-relaxed">
          {message}
        </p>

        {/* Linear Progress Bar (for active stage) */}
        {status === 'active' && progress !== undefined && (
          <div className="relative w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
            <div
              className="absolute inset-0 h-full bg-gradient-to-r from-[var(--electric-cyan)] via-cyan-400 to-[var(--electric-cyan)] bg-[length:200%_100%] animate-gradient-flow transition-all duration-300 ease-out"
              style={{ width: `${progress * 100}%` }}
              role="progressbar"
              aria-valuenow={progress * 100}
              aria-valuemin={0}
              aria-valuemax={100}
            />
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>
        )}

        {/* Completion bar (for completed stages) */}
        {status === 'complete' && (
          <div className="w-full bg-[var(--data-green)]/20 rounded-full h-2.5 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-[var(--data-green)] to-green-500 animate-fill-bar"></div>
          </div>
        )}
      </div>
    </div>
  )
}
