/**
 * Custom hook for consuming Server-Sent Events (SSE) from the thinking process stream
 *
 * This hook manages the EventSource connection and provides state updates
 * as the AI processes a message through various thinking stages.
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ThinkingStage, DEFAULT_THINKING_STAGES } from './thinking-process'

interface StreamResult {
  success: boolean
  conversationId: string
  userMessage: any
  assistantMessage: any
  sessionId: string
  pageSpec?: any
}

interface UseThinkingStreamOptions {
  onComplete?: (result: StreamResult) => void
  onError?: (error: string) => void
}

export function useThinkingStream(options: UseThinkingStreamOptions = {}) {
  const [stages, setStages] = useState<ThinkingStage[]>(
    DEFAULT_THINKING_STAGES.map(stage => ({ ...stage, status: 'pending' as const }))
  )
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<StreamResult | null>(null)

  const eventSourceRef = useRef<EventSource | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const updateStage = useCallback((stageId: string, updates: Partial<ThinkingStage>) => {
    setStages(prev =>
      prev.map(stage =>
        stage.id === stageId ? { ...stage, ...updates } : stage
      )
    )
  }, [])

  const startStream = useCallback(async (message: string, conversationId?: string) => {
    // Reset state
    setStages(DEFAULT_THINKING_STAGES.map(stage => ({ ...stage, status: 'pending' as const })))
    setCurrentStageIndex(0)
    setIsStreaming(true)
    setError(null)
    setResult(null)

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController()

    try {
      // Make POST request to initiate stream
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, conversationId }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Response body is not readable')
      }

      // Read stream
      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n\n')

        for (const line of lines) {
          if (!line.trim()) continue

          // Parse SSE format: "event: <type>\ndata: <json>"
          const eventMatch = line.match(/event: (\w+)\ndata: (.+)/)
          if (!eventMatch) continue

          const [, eventType, dataStr] = eventMatch
          const data = JSON.parse(dataStr)

          switch (eventType) {
            case 'stage':
              const { stageId, status, message: msg, progress, timestamp } = data

              // Find stage index
              const stageIndex = stages.findIndex(s => s.id === stageId)
              if (stageIndex !== -1) {
                setCurrentStageIndex(stageIndex)

                if (status === 'active') {
                  updateStage(stageId, {
                    status: 'active',
                    message: msg,
                    progress: progress || 0,
                    startTime: timestamp
                  })
                } else if (status === 'complete') {
                  updateStage(stageId, {
                    status: 'complete',
                    message: msg,
                    endTime: timestamp,
                    duration: timestamp - (stages[stageIndex].startTime || timestamp)
                  })
                } else if (status === 'error') {
                  updateStage(stageId, {
                    status: 'error',
                    message: msg
                  })
                }
              }
              break

            case 'complete':
              setResult(data)
              setIsStreaming(false)
              options.onComplete?.(data)
              break

            case 'error':
              setError(data.message)
              setIsStreaming(false)
              options.onError?.(data.message)
              break
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Stream was cancelled by user
        setError('Stream cancelled')
        setIsStreaming(false)
      } else {
        console.error('Stream error:', err)
        setError(err.message || 'Stream error')
        setIsStreaming(false)
        options.onError?.(err.message || 'Stream error')
      }
    }
  }, [stages, updateStage, options])

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsStreaming(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelStream()
    }
  }, [cancelStream])

  return {
    stages,
    currentStageIndex,
    isStreaming,
    error,
    result,
    startStream,
    cancelStream
  }
}
