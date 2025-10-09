import React from 'react'

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-electric-cyan text-deep-indigo'
            : 'bg-light-data-gray text-charcoal-gray border border-electric-cyan/30'
        }`}
      >
        <div className="text-sm font-inter leading-relaxed whitespace-pre-wrap break-words">
          {content}
        </div>
        {timestamp && (
          <div
            className={`text-xs mt-1 font-inter ${
              isUser ? 'text-deep-indigo/70' : 'text-charcoal-gray/70'
            }`}
          >
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  )
}
