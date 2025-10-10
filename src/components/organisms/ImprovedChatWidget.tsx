'use client'

import React, { useState, useRef, useEffect } from 'react'
import ChatInterface from './ChatInterface'
import { PageSpecification } from '@/lib/page-generation'

interface ImprovedChatWidgetProps {
  onPageGenerated?: (pageSpecification: PageSpecification) => void
}

export default function ImprovedChatWidget({ onPageGenerated }: ImprovedChatWidgetProps) {
  const [mode, setMode] = useState<'bubble' | 'bar' | 'full'>('bubble')
  const [barInput, setBarInput] = useState('')
  const [isBarLoading, setIsBarLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const chatInterfaceRef = useRef<any>(null)

  // Handle sending message from the bar (open full chat with thinking process)
  const handleBarSend = async () => {
    if (!barInput.trim() || isBarLoading) return

    // Store the message to send
    const messageToSend = barInput

    // Clear input immediately
    setBarInput('')

    // Switch to full mode so user can see the thinking process
    setMode('full')

    // Wait a moment for ChatInterface to mount, then send the message
    setTimeout(() => {
      // Trigger message send in ChatInterface
      const event = new CustomEvent('sendChatMessage', {
        detail: { message: messageToSend, conversationId }
      })
      window.dispatchEvent(event)
    }, 100)
  }

  // Handle Enter key in bar input
  const handleBarKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleBarSend()
    }
  }

  return (
    <>
      {/* Floating Bubble (Initial State) */}
      {mode === 'bubble' && (
        <button
          onClick={() => setMode('bar')}
          className="fixed bottom-6 right-6 w-16 h-16 bg-[var(--electric-cyan)] text-[var(--deep-indigo)] rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 group"
          aria-label="Open chat"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--data-green)] rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {/* Chat Bar (Expanded Pill Shape) */}
      {mode === 'bar' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4">
          <div className="bg-white rounded-full shadow-2xl border-2 border-[var(--electric-cyan)] px-6 py-3 flex items-center gap-3 max-w-3xl w-full mx-4">
            {/* ConsumerIQ Icon */}
            <div className="w-10 h-10 bg-[var(--deep-indigo)] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[var(--electric-cyan)] font-mont font-bold text-xl">C</span>
            </div>

            {/* Input Field - Functional */}
            <input
              type="text"
              placeholder="Ask ConsumerIQ anything..."
              value={barInput}
              onChange={(e) => setBarInput(e.target.value)}
              onKeyPress={handleBarKeyPress}
              disabled={isBarLoading}
              className="flex-1 bg-transparent px-4 py-2 font-inter text-[var(--charcoal-gray)] placeholder-gray-500 focus:outline-none disabled:opacity-50"
              autoFocus
            />

            {/* Loading Indicator */}
            {isBarLoading && (
              <div className="flex-shrink-0">
                <div className="w-5 h-5 border-2 border-[var(--electric-cyan)] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* Send Button */}
            {!isBarLoading && barInput.trim() && (
              <button
                onClick={handleBarSend}
                className="bg-[var(--electric-cyan)] text-[var(--deep-indigo)] rounded-full p-2.5 hover:bg-[var(--deep-indigo)] hover:text-[var(--electric-cyan)] transition-colors flex-shrink-0"
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            )}

            {/* Expand Button */}
            <button
              onClick={() => setMode('full')}
              className="bg-[var(--electric-cyan)] text-[var(--deep-indigo)] rounded-full p-2.5 hover:bg-[var(--deep-indigo)] hover:text-[var(--electric-cyan)] transition-colors flex-shrink-0"
              aria-label="Expand chat"
              title="View full conversation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>

            {/* Close Button */}
            <button
              onClick={() => setMode('bubble')}
              className="text-[var(--charcoal-gray)] hover:text-[var(--risk-red)] rounded-full p-2 transition-colors flex-shrink-0"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Full Chat Interface */}
      {mode === 'full' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-[var(--electric-cyan)] max-w-4xl w-full mx-4 flex flex-col overflow-hidden" style={{ height: '70vh', maxHeight: '600px' }}>
            {/* Header */}
            <div className="bg-[var(--deep-indigo)] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--electric-cyan)] rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-[var(--deep-indigo)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-mont font-semibold text-lg">ConsumerIQ Assistant</div>
                  <div className="text-xs text-[var(--light-data-gray)] font-inter">Online • Powered by Claude AI</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Minimize to Bar */}
                <button
                  onClick={() => setMode('bar')}
                  className="text-[var(--electric-cyan)] hover:bg-[var(--electric-cyan)] hover:text-[var(--deep-indigo)] rounded-lg p-2 transition-colors"
                  aria-label="Minimize chat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Close */}
                <button
                  onClick={() => setMode('bubble')}
                  className="text-[var(--electric-cyan)] hover:bg-[var(--electric-cyan)] hover:text-[var(--deep-indigo)] rounded-lg p-2 transition-colors"
                  aria-label="Close chat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="flex-1 overflow-hidden">
              <ChatInterface
                onPageGenerated={onPageGenerated}
                conversationId={conversationId}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
