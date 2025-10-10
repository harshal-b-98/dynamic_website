'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import ChatMessage from '@/components/atoms/ChatMessage'
import ChatInput from '@/components/molecules/ChatInput'
import ThinkingProcessView from '@/components/organisms/ThinkingProcessView'
import { PageSpecification } from '@/lib/page-generation'
import { ThinkingStage } from '@/lib/thinking-process'
import { useThinkingStream } from '@/lib/use-thinking-stream'

interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
  metadata: Record<string, any>
}

interface ChatInterfaceProps {
  initialMessages?: Message[]
  conversationId?: string
  onPageGenerated?: (pageSpec: PageSpecification) => void
  onStageUpdate?: (stages: ThinkingStage[]) => void
}

export default function ChatInterface({
  initialMessages = [],
  conversationId: initialConversationId,
  onPageGenerated,
  onStageUpdate
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  )
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Use thinking stream hook
  const {
    stages,
    isStreaming,
    error: streamError,
    result,
    startStream,
    cancelStream
  } = useThinkingStream({
    onComplete: (streamResult) => {
      // Update conversation ID if it's a new conversation
      if (streamResult.conversationId && !conversationId) {
        setConversationId(streamResult.conversationId)
      }

      // Notify parent if page was generated
      if (streamResult.pageSpec && onPageGenerated) {
        onPageGenerated(streamResult.pageSpec)
      }

      // Add both user and assistant messages to the list
      setMessages((prev) => [
        ...prev,
        streamResult.userMessage,
        streamResult.assistantMessage,
      ])
    },
    onError: (errorMessage) => {
      setError(errorMessage)
    }
  })

  // Pass stage updates to parent (for ThinkingOverlay)
  useEffect(() => {
    if (onStageUpdate) {
      onStageUpdate(stages)
    }
  }, [stages, onStageUpdate])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load conversation history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const url = conversationId
          ? `/api/chat/history?conversationId=${conversationId}`
          : '/api/chat/history'

        const response = await fetch(url)
        const data = await response.json()

        if (response.ok && data.messages) {
          setMessages(data.messages)
          if (data.conversation) {
            setConversationId(data.conversation.id)
          }
        }
      } catch (err) {
        console.error('Error loading chat history:', err)
      }
    }

    loadHistory()
  }, [conversationId])

  const handleSendMessage = useCallback(async (messageContent: string) => {
    setError(null)

    // Start the thinking stream
    await startStream(messageContent, conversationId)
  }, [conversationId, startStream])

  // Listen for external message send requests (from bar mode)
  useEffect(() => {
    const handleExternalSend = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail && customEvent.detail.message) {
        handleSendMessage(customEvent.detail.message)
      }
    }

    window.addEventListener('sendChatMessage', handleExternalSend)
    return () => window.removeEventListener('sendChatMessage', handleExternalSend)
  }, [conversationId, handleSendMessage])

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isStreaming && (
            <div className="text-center text-gray-500 mt-8">
              <p className="text-lg mb-2">👋 Welcome!</p>
              <p>Start a conversation by sending a message below.</p>
              <p className="text-sm mt-4">Try asking about ConsumerIQ features!</p>
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              timestamp={msg.created_at}
            />
          ))}

          {/* Show thinking process instead of simple loading spinner */}
          {isStreaming && (
            <ThinkingProcessView
              isVisible={true}
              onCancel={cancelStream}
            />
          )}

          {(error || streamError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error || streamError}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isStreaming}
        placeholder="Type your message..."
      />
    </div>
  )
}
