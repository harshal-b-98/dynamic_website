'use client'

/**
 * Component Error Boundary
 *
 * Gracefully handles component rendering errors without breaking the entire page
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  componentType: string
  componentId: string
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for monitoring
    console.error(
      `Component Error Boundary caught error in ${this.props.componentType} (${this.props.componentId}):`,
      error,
      errorInfo
    )

    this.setState({
      error,
      errorInfo
    })

    // TODO: Send to error tracking service (Sentry, DataDog, etc.)
    // trackError({
    //   error,
    //   componentType: this.props.componentType,
    //   componentId: this.props.componentId,
    //   errorInfo
    // })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="my-4 p-6 border-2 border-red-200 bg-red-50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">
                Component Rendering Error
              </h3>
              <p className="mt-1 text-sm text-red-700">
                Failed to render component:{' '}
                <code className="px-1 py-0.5 bg-red-100 rounded text-xs font-mono">
                  {this.props.componentType}
                </code>
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-3">
                  <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                    Show error details
                  </summary>
                  <div className="mt-2 p-3 bg-red-100 rounded text-xs font-mono text-red-900 overflow-x-auto">
                    <div className="font-bold mb-2">{this.state.error.name}: {this.state.error.message}</div>
                    <pre className="whitespace-pre-wrap text-xs">
                      {this.state.error.stack}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
