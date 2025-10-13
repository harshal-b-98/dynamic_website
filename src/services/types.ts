/**
 * Base Service Types
 *
 * Common types and interfaces for service layer
 */

/**
 * Standard service result wrapper
 */
export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
  errorCode?: string
}

/**
 * Service metrics for observability
 */
export interface ServiceMetrics {
  requestId: string
  serviceName: string
  operationName: string
  duration: number
  timestamp: Date
  success: boolean
  error?: string
}

/**
 * Base service configuration
 */
export interface ServiceConfig {
  enableMetrics?: boolean
  enableLogging?: boolean
  timeout?: number
}
