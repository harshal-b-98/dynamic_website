'use client'

import React, { useState, useEffect, useRef } from 'react'
import ChatMessage from '@/components/atoms/ChatMessage'
import ChatInput from '@/components/molecules/ChatInput'

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
}

export default function ChatInterface({
  initialMessages = [],
  conversationId: initialConversationId
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  const handleSendMessage = async (messageContent: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          conversationId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      // Update conversation ID if it's a new conversation
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId)
      }

      // Add both user and assistant messages to the list
      setMessages((prev) => [
        ...prev,
        data.userMessage,
        data.assistantMessage,
      ])
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-2">👋 Welcome!</p>
            <p>Start a conversation by sending a message below.</p>
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

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 rounded-lg px-4 py-3 border border-gray-200">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        placeholder="Type your message..."
      />
    </div>
  )
}
