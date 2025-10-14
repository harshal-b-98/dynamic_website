/**
 * Health Check Endpoint
 *
 * Provides health status for monitoring systems and load balancers
 * Checks critical system components: Database, Cache, LLM
 */

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface HealthCheck {
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  latency?: number
  error?: string
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  checks: {
    database: HealthCheck
    cache: HealthCheck
    llm: HealthCheck
  }
}

const startTime = Date.now()

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now()

  try {
    // Simple query to verify database connection
    const { data, error } = await supabaseAdmin
      .from('dyn_conversations')
      .select('id')
      .limit(1)

    const latency = Date.now() - start

    if (error) {
      return {
        name: 'database',
        status: 'unhealthy',
        latency,
        error: error.message
      }
    }

    // Check latency threshold
    const status = latency > 1000 ? 'degraded' : 'healthy'

    return {
      name: 'database',
      status,
      latency
    }
  } catch (error: any) {
    return {
      name: 'database',
      status: 'unhealthy',
      latency: Date.now() - start,
      error: error.message || 'Unknown error'
    }
  }
}

/**
 * Check cache connectivity (Supabase-based cache)
 */
async function checkCache(): Promise<HealthCheck> {
  const start = Date.now()

  try {
    // Check if page_cache table exists and is accessible
    const { data, error } = await supabaseAdmin
      .from('page_cache')
      .select('id')
      .limit(1)

    const latency = Date.now() - start

    if (error) {
      // If table doesn't exist yet, that's okay (not deployed)
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        return {
          name: 'cache',
          status: 'degraded',
          latency,
          error: 'Cache table not yet created'
        }
      }

      return {
        name: 'cache',
        status: 'unhealthy',
        latency,
        error: error.message
      }
    }

    // Check latency threshold
    const status = latency > 500 ? 'degraded' : 'healthy'

    return {
      name: 'cache',
      status,
      latency
    }
  } catch (error: any) {
    return {
      name: 'cache',
      status: 'degraded',
      latency: Date.now() - start,
      error: error.message || 'Cache check failed'
    }
  }
}

/**
 * Check LLM API connectivity
 * NOTE: We don't actually call the LLM to avoid costs on every health check
 */
async function checkLLM(): Promise<HealthCheck> {
  // Check if API key is configured
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY

  if (!hasAnthropicKey && !hasOpenAIKey) {
    return {
      name: 'llm',
      status: 'unhealthy',
      error: 'No LLM API keys configured'
    }
  }

  // API keys are configured, assume healthy
  // We don't make actual API calls to avoid costs
  return {
    name: 'llm',
    status: 'healthy',
    latency: 0
  }
}

/**
 * GET /api/health
 * Returns health status of the application
 */
export async function GET() {
  try {
    // Run all health checks in parallel
    const [database, cache, llm] = await Promise.all([
      checkDatabase(),
      checkCache(),
      checkLLM()
    ])

    // Determine overall status
    const checks = { database, cache, llm }
    const statuses = [database.status, cache.status, llm.status]

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy'

    if (statuses.some(s => s === 'unhealthy')) {
      overallStatus = 'unhealthy'
    } else if (statuses.some(s => s === 'degraded')) {
      overallStatus = 'degraded'
    } else {
      overallStatus = 'healthy'
    }

    const response: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000), // seconds
      checks
    }

    // Return appropriate HTTP status code
    const httpStatus = overallStatus === 'unhealthy' ? 503 : 200

    return NextResponse.json(response, { status: httpStatus })
  } catch (error: any) {
    // Catch-all error handler
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - startTime) / 1000),
        checks: {
          database: { name: 'database', status: 'unhealthy', error: 'Health check failed' },
          cache: { name: 'cache', status: 'unhealthy', error: 'Health check failed' },
          llm: { name: 'llm', status: 'unhealthy', error: 'Health check failed' }
        },
        error: error.message || 'Unknown error'
      } as HealthResponse & { error: string },
      { status: 503 }
    )
  }
}

/**
 * HEAD /api/health
 * Lightweight health check for load balancers
 */
export async function HEAD() {
  try {
    // Quick database check only
    const { error } = await supabaseAdmin
      .from('dyn_conversations')
      .select('id')
      .limit(1)

    if (error) {
      return new NextResponse(null, { status: 503 })
    }

    return new NextResponse(null, { status: 200 })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}
