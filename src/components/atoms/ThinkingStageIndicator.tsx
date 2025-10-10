/**
 * Thinking Stage Indicator Component
 *
 * Displays a single stage in the AI thinking process with status indicator,
 * name, message, and optional duration.
 */

import { ThinkingStage } from '@/lib/thinking-process'

interface ThinkingStageIndicatorProps {
  stage: ThinkingStage
  isActive: boolean
}

export default function ThinkingStageIndicator({ stage, isActive }: ThinkingStageIndicatorProps) {
  const { status, name, message, duration } = stage

  // Status icon and color
  const getStatusIcon = () => {
    switch (status) {
      case 'complete':
        return '✓'
      case 'active':
        return '⏳'
      case 'error':
        return '✗'
      default:
        return '○'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'complete':
        return 'text-[var(--data-green)]'
      case 'active':
        return 'text-[var(--electric-cyan)]'
      case 'error':
        return 'text-[var(--risk-red)]'
      default:
        return 'text-[var(--light-data-gray)]'
    }
  }

  const getBackgroundColor = () => {
    switch (status) {
      case 'complete':
        return 'bg-[var(--data-green)]/10'
      case 'active':
        return 'bg-[var(--electric-cyan)]/10'
      case 'error':
        return 'bg-[var(--risk-red)]/10'
      default:
        return 'bg-gray-50'
    }
  }

  return (
    <div
      className={`
        flex items-start gap-3 p-3 rounded-lg transition-all duration-300
        ${getBackgroundColor()}
        ${isActive ? 'scale-105 shadow-md' : ''}
      `}
    >
      {/* Status Icon */}
      <div
        className={`
          flex items-center justify-center w-8 h-8 rounded-full
          ${getStatusColor()}
          ${status === 'active' ? 'animate-pulse' : ''}
          font-bold text-lg
        `}
        aria-label={`${name} ${status}`}
      >
        {getStatusIcon()}
      </div>

      {/* Stage Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={`
              font-mont font-semibold text-sm
              ${status === 'active' ? 'text-[var(--deep-indigo)]' : 'text-[var(--charcoal-gray)]'}
            `}
          >
            {name}
          </h3>
          {duration !== undefined && duration > 0 && (
            <span className="text-xs text-[var(--charcoal-gray)] opacity-60 font-inter">
              {(duration / 1000).toFixed(1)}s
            </span>
          )}
        </div>

        <p
          className={`
            text-sm font-inter mt-0.5
            ${status === 'active' ? 'text-[var(--charcoal-gray)]' : 'text-[var(--charcoal-gray)] opacity-70'}
          `}
        >
          {message}
        </p>

        {/* Progress bar for active stage */}
        {status === 'active' && stage.progress !== undefined && (
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[var(--electric-cyan)] h-full transition-all duration-500 ease-out"
              style={{ width: `${stage.progress * 100}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
