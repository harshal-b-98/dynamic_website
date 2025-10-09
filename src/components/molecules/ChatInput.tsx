'use client'

import React, { useState, KeyboardEvent } from 'react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export default function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = 'Type your message...'
}: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-electric-cyan/30 bg-white p-4">
      <div className="flex gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-electric-cyan/30 px-4 py-3 font-inter focus:outline-none focus:ring-2 focus:ring-electric-cyan focus:border-transparent disabled:bg-light-data-gray disabled:cursor-not-allowed"
          style={{ minHeight: '52px', maxHeight: '120px' }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="px-6 py-3 bg-electric-cyan text-deep-indigo rounded-lg font-mont font-semibold hover:bg-deep-indigo hover:text-electric-cyan focus:outline-none focus:ring-2 focus:ring-electric-cyan focus:ring-offset-2 disabled:bg-light-data-gray disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
      <div className="text-xs text-charcoal-gray/70 mt-2 font-inter">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  )
}
