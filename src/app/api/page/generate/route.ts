import { NextRequest, NextResponse } from 'next/server'
import { pageGenerationService } from '@/services'
import { PageGenerationRequest, PageGenerationResponse } from '@/lib/page-generation'
import { v4 as uuidv4 } from 'uuid'

/**
 * POST /api/page/generate
 * Generate dynamic page specification using LLM
 */
export async function POST(request: NextRequest) {
  const requestId = uuidv4()

  try {
    // Parse request body
    const body = await request.json() as PageGenerationRequest

    // Call service layer
    const result = await pageGenerationService.generatePage(body)

    if (!result.success || !result.data) {
      // Determine appropriate HTTP status code based on error
      let status = 500
      if (result.error?.includes('timeout')) {
        status = 504
      } else if (result.error?.includes('required')) {
        status = 400
      } else if (result.error?.includes('unavailable')) {
        status = 503
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Page generation failed'
        } as PageGenerationResponse,
        { status }
      )
    }

    // Success - return page specification
    return NextResponse.json(
      {
        success: true,
        pageSpec: result.data.pageSpec,
        cached: result.data.cached
      } as PageGenerationResponse,
      { status: 200 }
    )

  } catch (error) {
    console.error('Error in page generation route:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during page generation'
      } as PageGenerationResponse,
      { status: 500 }
    )
  }
}
