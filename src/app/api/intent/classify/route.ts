import { NextRequest, NextResponse } from 'next/server'
import { intentClassificationService } from '@/services'

/**
 * POST /api/intent/classify
 * Classify user intent using LLM
 */
export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    // Call service layer
    const result = await intentClassificationService.classifyIntent({ message })

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || 'Failed to classify intent' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      classification: result.data.classification,
      usage: result.data.usage
    })
  } catch (error) {
    console.error('Error in intent classification route:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
