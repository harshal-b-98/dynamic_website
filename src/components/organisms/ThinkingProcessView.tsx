/**
 * Thinking Process View Component
 *
 * Main container that displays the AI's thinking process during page generation.
 * Shows all 5 stages with real-time updates, progress tracking, and engagement features.
 */

'use client'

import { useState, useEffect } from 'react'
import ThinkingStageIndicator from '@/components/atoms/ThinkingStageIndicator'
import {
  ThinkingStage,
  DEFAULT_THINKING_STAGES,
  DID_YOU_KNOW_TIPS,
  TOTAL_ESTIMATED_TIME
} from '@/lib/thinking-process'

interface ThinkingProcessViewProps {
  isVisible: boolean
  onCancel?: () => void
}

export default function ThinkingProcessView({ isVisible, onCancel }: ThinkingProcessViewProps) {
  const [stages, setStages] = useState<ThinkingStage[]>(
    DEFAULT_THINKING_STAGES.map(stage => ({ ...stage, status: 'pending' as const }))
  )
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [overallProgress, setOverallProgress] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [currentTip, setCurrentTip] = useState(
    DID_YOU_KNOW_TIPS[Math.floor(Math.random() * DID_YOU_KNOW_TIPS.length)]
  )

  // Timer for elapsed time
  useEffect(() => {
    if (!isVisible || isComplete) return

    const startTime = Date.now()
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - startTime)
    }, 100)

    return () => clearInterval(timer)
  }, [isVisible, isComplete])

  // Rotate tips every 5 seconds
  useEffect(() => {
    if (!isVisible || isComplete) return

    const tipInterval = setInterval(() => {
      setCurrentTip(DID_YOU_KNOW_TIPS[Math.floor(Math.random() * DID_YOU_KNOW_TIPS.length)])
    }, 5000)

    return () => clearInterval(tipInterval)
  }, [isVisible, isComplete])

  // Calculate overall progress based on stages
  useEffect(() => {
    const completedStages = stages.filter(s => s.status === 'complete').length
    const activeStageProgress = stages[currentStageIndex]?.progress || 0
    const progress = (completedStages + activeStageProgress) / stages.length
    setOverallProgress(progress * 100)

    // Check if all stages complete
    if (completedStages === stages.length) {
      setIsComplete(true)
    }
  }, [stages, currentStageIndex])

  if (!isVisible) return null

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-mont font-bold text-[var(--deep-indigo)]">
          {isComplete ? '✨ Page Ready!' : '🤔 AI is Thinking...'}
        </h2>
        <p className="text-sm text-[var(--charcoal-gray)] opacity-70 font-inter">
          {isComplete
            ? 'Your personalized page has been generated!'
            : 'Creating a personalized response just for you'}
        </p>
      </div>

      {/* Overall Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-inter text-[var(--charcoal-gray)]">
          <span>Overall Progress</span>
          <span>{Math.round(overallProgress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[var(--electric-cyan)] to-[var(--deep-indigo)] h-full transition-all duration-500 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs font-inter text-[var(--charcoal-gray)] opacity-60">
          <span>{(elapsedTime / 1000).toFixed(1)}s elapsed</span>
          <span>~{(TOTAL_ESTIMATED_TIME / 1000).toFixed(0)}s total</span>
        </div>
      </div>

      {/* Thinking Stages */}
      <div className="space-y-3">
        {stages.map((stage, index) => (
          <ThinkingStageIndicator
            key={stage.id}
            stage={stage}
            isActive={index === currentStageIndex && stage.status === 'active'}
          />
        ))}
      </div>

      {/* Did You Know Tip */}
      {!isComplete && (
        <div className="bg-gradient-to-r from-[var(--electric-cyan)]/5 to-[var(--deep-indigo)]/5 border border-[var(--electric-cyan)]/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--electric-cyan)]/10">
              <span className="text-lg">💡</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-mont font-semibold text-sm text-[var(--deep-indigo)] mb-1">
                Did you know?
              </h3>
              <p className="text-sm font-inter text-[var(--charcoal-gray)] opacity-80">
                {currentTip}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Completion Celebration */}
      {isComplete && (
        <div className="text-center space-y-4 animate-fade-in">
          <div className="text-6xl animate-bounce">🎉</div>
          <p className="text-lg font-inter text-[var(--charcoal-gray)]">
            Your page is ready to view!
          </p>
        </div>
      )}

      {/* Cancel Button */}
      {!isComplete && onCancel && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-sm font-inter text-[var(--charcoal-gray)] hover:text-[var(--risk-red)] transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Hook to manage thinking process state and updates
 * Use this hook in parent components to control the thinking process
 */
export function useThinkingProcess() {
  const [stages, setStages] = useState<ThinkingStage[]>(
    DEFAULT_THINKING_STAGES.map(stage => ({ ...stage, status: 'pending' as const }))
  )
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const updateStage = (stageId: string, updates: Partial<ThinkingStage>) => {
    setStages(prev =>
      prev.map(stage =>
        stage.id === stageId ? { ...stage, ...updates } : stage
      )
    )
  }

  const startStage = (stageIndex: number) => {
    if (stageIndex >= stages.length) return

    setCurrentStageIndex(stageIndex)
    updateStage(stages[stageIndex].id, {
      status: 'active',
      startTime: Date.now()
    })
  }

  const completeStage = (stageIndex: number, message?: string) => {
    if (stageIndex >= stages.length) return

    const stage = stages[stageIndex]
    updateStage(stage.id, {
      status: 'complete',
      endTime: Date.now(),
      duration: stage.startTime ? Date.now() - stage.startTime : undefined,
      message: message || stage.message
    })

    // Start next stage
    if (stageIndex < stages.length - 1) {
      setTimeout(() => startStage(stageIndex + 1), 200)
    } else {
      setIsComplete(true)
    }
  }

  const updateProgress = (stageIndex: number, progress: number) => {
    if (stageIndex >= stages.length) return
    updateStage(stages[stageIndex].id, { progress })
  }

  const reset = () => {
    setStages(DEFAULT_THINKING_STAGES.map(stage => ({ ...stage, status: 'pending' as const })))
    setCurrentStageIndex(0)
    setIsComplete(false)
  }

  return {
    stages,
    currentStageIndex,
    isComplete,
    startStage,
    completeStage,
    updateStage,
    updateProgress,
    reset
  }
}
