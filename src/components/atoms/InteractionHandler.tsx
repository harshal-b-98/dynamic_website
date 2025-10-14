'use client'

/**
 * Interaction Handler Component
 *
 * Wraps ANY interactive element (button, link, card, etc.) and triggers
 * AI page generation when clicked
 */

import { ReactNode, MouseEvent } from 'react'
import { InteractionHandlerProps } from '@/lib/interaction-types'

export interface InteractionHandlerComponentProps extends InteractionHandlerProps {
  children: ReactNode
  className?: string
  disabled?: boolean
  asChild?: boolean  // If true, passes props to child instead of wrapping in div
}

export default function InteractionHandler({
  children,
  className = '',
  disabled = false,
  interactionType,
  label,
  action,
  intent,
  description,
  href,
  onInteraction,
}: InteractionHandlerComponentProps) {

  const handleClick = async (e: MouseEvent) => {
    if (disabled) return

    // Prevent default behavior for links (we'll generate a page instead)
    if (href) {
      e.preventDefault()
    }

    // Don't propagate to parent handlers
    e.stopPropagation()

    // Call the interaction handler
    if (onInteraction) {
      await onInteraction({
        interactionType,
        label,
        action,
        intent: intent || 'unknown',  // Default to 'unknown' if not specified
        description,
        href,
      } as any)  // Type assertion needed since we're passing partial InteractionContext
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`interaction-handler ${disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'} ${className}`}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick(e as any)
        }
      }}
      aria-label={description || label}
      aria-disabled={disabled}
    >
      {children}
    </div>
  )
}

/**
 * Hook for creating interaction handlers
 * Use this in components to easily create interaction handlers
 */
export function useInteractionHandler(
  onInteraction?: (props: InteractionHandlerProps) => void | Promise<void>
) {
  const createHandler = (props: InteractionHandlerProps) => {
    return async () => {
      if (onInteraction) {
        await onInteraction(props)
      }
    }
  }

  return { createHandler }
}
