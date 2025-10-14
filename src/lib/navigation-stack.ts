/**
 * Navigation Stack Manager
 *
 * Manages page history and navigation for interactive page generation
 */

import { PageSpecification } from './page-generation'
import { InteractionContext, PageHistoryItem, NavigationStack } from './interaction-types'

// Re-export types for convenience
export type { NavigationStack, PageHistoryItem }

/**
 * Create a new navigation stack
 */
export function createNavigationStack(maxDepth: number = 5): NavigationStack {
  return {
    items: [],
    currentIndex: -1,
    maxDepth,
  }
}

/**
 * Push a new page onto the navigation stack
 */
export function pushPage(
  stack: NavigationStack,
  page: PageSpecification,
  interaction?: InteractionContext
): NavigationStack {
  const newItem: PageHistoryItem = {
    page,
    interaction,
    timestamp: Date.now(),
  }

  // If we're not at the end of the stack, remove everything after current position
  // (user navigated back and then went in a new direction)
  const items = stack.items.slice(0, stack.currentIndex + 1)

  // Add new page
  items.push(newItem)

  // Enforce max depth by removing oldest items
  const trimmedItems = items.length > stack.maxDepth
    ? items.slice(items.length - stack.maxDepth)
    : items

  return {
    ...stack,
    items: trimmedItems,
    currentIndex: trimmedItems.length - 1,
  }
}

/**
 * Navigate back in the stack
 */
export function goBack(stack: NavigationStack): NavigationStack | null {
  if (stack.currentIndex <= 0) {
    return null // Can't go back anymore
  }

  return {
    ...stack,
    currentIndex: stack.currentIndex - 1,
  }
}

/**
 * Navigate forward in the stack
 */
export function goForward(stack: NavigationStack): NavigationStack | null {
  if (stack.currentIndex >= stack.items.length - 1) {
    return null // Can't go forward anymore
  }

  return {
    ...stack,
    currentIndex: stack.currentIndex + 1,
  }
}

/**
 * Get the current page from the stack
 */
export function getCurrentPage(stack: NavigationStack): PageSpecification | null {
  if (stack.currentIndex < 0 || stack.currentIndex >= stack.items.length) {
    return null
  }

  return stack.items[stack.currentIndex].page
}

/**
 * Get the previous page from the stack
 */
export function getPreviousPage(stack: NavigationStack): PageSpecification | null {
  if (stack.currentIndex <= 0) {
    return null
  }

  return stack.items[stack.currentIndex - 1].page
}

/**
 * Check if can navigate back
 */
export function canGoBack(stack: NavigationStack): boolean {
  return stack.currentIndex > 0
}

/**
 * Check if can navigate forward
 */
export function canGoForward(stack: NavigationStack): boolean {
  return stack.currentIndex < stack.items.length - 1
}

/**
 * Get breadcrumb trail from the navigation stack
 */
export function getBreadcrumbs(stack: NavigationStack): Array<{
  title: string
  index: number
  isCurrent: boolean
}> {
  return stack.items.map((item, index) => ({
    title: item.page.metadata.title,
    index,
    isCurrent: index === stack.currentIndex,
  }))
}

/**
 * Navigate to a specific index in the stack
 */
export function goToIndex(stack: NavigationStack, index: number): NavigationStack | null {
  if (index < 0 || index >= stack.items.length) {
    return null
  }

  return {
    ...stack,
    currentIndex: index,
  }
}

/**
 * Clear the navigation stack
 */
export function clearStack(stack: NavigationStack): NavigationStack {
  return {
    ...stack,
    items: [],
    currentIndex: -1,
  }
}

/**
 * Get stack size
 */
export function getStackSize(stack: NavigationStack): number {
  return stack.items.length
}

/**
 * Get navigation context for page generation
 * (Recent pages for context)
 */
export function getNavigationContext(stack: NavigationStack, depth: number = 3): PageHistoryItem[] {
  if (stack.currentIndex < 0) {
    return []
  }

  // Get last N pages leading up to current
  const startIndex = Math.max(0, stack.currentIndex - depth + 1)
  return stack.items.slice(startIndex, stack.currentIndex + 1)
}
