'use client'

/**
 * Linear Thinking Process Component
 *
 * Shows AI thinking as a horizontal step-by-step progression
 * Each stage animates in sequence: thinking → done → next stage
 */

import React, { useState, useEffect } from 'react'
import { ThinkingStage, DEFAULT_THINKING_STAGES, STAGE_DURATIONS } from '@/lib/thinking-process'

interface LinearThinkingProcessProps {
  isVisible: boolean
  stages: ThinkingStage[]  // Receive stages from parent (connected to real SSE stream)
  onCancel?: () => void
}

export default function LinearThinkingProcess({ isVisible, stages, onCancel }: LinearThinkingProcessProps) {
  const [overallProgress, setOverallProgress] = useState(0)

  // Find current active stage index
  const currentStageIndex = stages.findIndex(s => s.status === 'active')

  // Calculate overall progress
  useEffect(() => {
    const completedStages = stages.filter(s => s.status === 'complete').length
    const activeStageProgress = currentStageIndex >= 0 ? (stages[currentStageIndex]?.progress || 0) : 0
    const progress = ((completedStages + activeStageProgress) / stages.length) * 100
    setOverallProgress(progress)
  }, [stages, currentStageIndex])

  if (!isVisible) return null

  const getStageIcon = (stage: ThinkingStage, index: number) => {
    switch (stage.status) {
      case 'complete':
        return (
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'active':
        return (
          <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )
      default:
        return <span className="text-2xl font-bold text-gray-400">{index + 1}</span>
    }
  }

  const getStageColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-[var(--data-green)]'
      case 'active':
        return 'bg-gradient-to-r from-[var(--electric-cyan)] to-cyan-400'
      default:
        return 'bg-gray-300'
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--electric-cyan)] rounded-full mb-6 animate-pulse shadow-2xl shadow-cyan-500/50">
          <svg className="w-10 h-10 text-[var(--deep-indigo)] animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-mont font-bold text-white mb-3">
          ConsumerIQ AI at Work
        </h1>
        <p className="text-xl text-[var(--light-data-gray)] font-inter">
          Creating your personalized experience
        </p>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-12">
        <div className="relative w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--electric-cyan)] via-cyan-400 to-[var(--electric-cyan)] bg-[length:200%_100%] animate-gradient-flow transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-[var(--light-data-gray)]">
          <span>Overall Progress</span>
          <span className="font-bold">{Math.round(overallProgress)}%</span>
        </div>
      </div>

      {/* Horizontal Stage Timeline */}
      <div className="relative mb-8">
        {/* Connecting Line */}
        <div className="absolute top-12 left-0 right-0 h-1 bg-gray-700 z-0">
          <div
            className="h-full bg-gradient-to-r from-[var(--data-green)] to-[var(--electric-cyan)] transition-all duration-1000 ease-out"
            style={{ width: `${(stages.filter(s => s.status === 'complete').length / stages.length) * 100}%` }}
          />
        </div>

        {/* Stages */}
        <div className="relative z-10 grid grid-cols-5 gap-4">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className={`flex flex-col items-center transition-all duration-500 ${
                stage.status === 'active' ? 'scale-110' : ''
              }`}
              style={{
                opacity: stage.status === 'pending' ? 0.5 : 1,
                transitionDelay: `${index * 100}ms`
              }}
            >
              {/* Stage Circle */}
              <div
                className={`
                  w-24 h-24 rounded-full flex items-center justify-center mb-4
                  ${getStageColor(stage.status)}
                  ${stage.status === 'active' ? 'animate-pulse shadow-2xl' : 'shadow-xl'}
                  ${stage.status === 'complete' ? 'animate-bounce-once' : ''}
                  transition-all duration-500
                `}
              >
                {getStageIcon(stage, index)}
              </div>

              {/* Stage Label */}
              <div className="text-center">
                <h3 className={`font-mont font-bold text-lg mb-1 transition-colors duration-300 ${
                  stage.status === 'complete' ? 'text-[var(--data-green)]' :
                  stage.status === 'active' ? 'text-[var(--electric-cyan)]' :
                  'text-gray-400'
                }`}>
                  {stage.name}
                </h3>
                <p className={`text-sm font-inter transition-colors duration-300 ${
                  stage.status === 'active' ? 'text-white' : 'text-[var(--light-data-gray)]'
                }`}>
                  {stage.status === 'complete' ? '✓ Done' :
                   stage.status === 'active' ? stage.message :
                   'Waiting...'}
                </p>

                {/* Active Stage Progress */}
                {stage.status === 'active' && stage.progress !== undefined && (
                  <div className="mt-2 text-[var(--electric-cyan)] font-bold text-lg animate-pulse">
                    {Math.round(stage.progress * 100)}%
                  </div>
                )}

                {/* Completion Time */}
                {stage.status === 'complete' && stage.duration && (
                  <div className="mt-1 text-xs text-[var(--data-green)]">
                    {(stage.duration / 1000).toFixed(1)}s
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Stage Detail */}
      {stages[currentStageIndex]?.status === 'active' && (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-[var(--electric-cyan)]/30 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--electric-cyan)] rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
              <svg className="w-6 h-6 text-[var(--deep-indigo)] animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-mont font-bold text-white mb-1">
                {stages[currentStageIndex].message}
              </h3>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--electric-cyan)] to-cyan-400 transition-all duration-300"
                  style={{ width: `${(stages[currentStageIndex].progress || 0) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Button */}
      {onCancel && (
        <div className="flex justify-center">
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-inter rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
