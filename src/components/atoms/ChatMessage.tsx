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
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-900 border border-gray-200'
        }`}
      >
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {content}
        </div>
        {timestamp && (
          <div
            className={`text-xs mt-1 ${
              isUser ? 'text-indigo-200' : 'text-gray-500'
            }`}
          >
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  )
}
