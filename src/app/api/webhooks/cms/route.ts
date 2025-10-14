/**
 * CMS Webhook Receiver API
 *
 * Receives webhook notifications from CMS platforms and triggers
 * vector database synchronization.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSyncTracker, getSyncPipeline, getVerificationFunction, type CMSContent } from '@/lib/cms'

/**
 * POST /api/webhooks/cms
 *
 * Receive and process CMS webhook events
 *
 * Headers:
 * - x-webhook-signature: HMAC signature for verification
 * - x-webhook-source: CMS source (wordpress, contentful, etc.)
 * - x-webhook-timestamp: Timestamp for replay protection
 *
 * Body:
 * {
 *   event: string (e.g., "content.created", "content.updated", "content.deleted")
 *   content?: {
 *     id: string
 *     type: string
 *     title: string
 *     content: string
 *     url?: string
 *     metadata?: object
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get headers
    const signature = request.headers.get('x-webhook-signature')
    const source = request.headers.get('x-webhook-source') || 'unknown'
    const timestamp = request.headers.get('x-webhook-timestamp')

    // Get raw body for signature verification
    const rawBody = await request.text()

    // Verify signature
    if (!signature || !process.env.SKIP_WEBHOOK_VERIFICATION) {
      try {
        const verifyFn = getVerificationFunction(source)
        const isValid = verifyFn(rawBody, signature)

        if (!isValid) {
          return NextResponse.json(
            { error: 'Invalid webhook signature' },
            { status: 401 }
          )
        }
      } catch (error) {
        console.error('Webhook verification error:', error)
        return NextResponse.json(
          { error: 'Webhook verification failed' },
          { status: 401 }
        )
      }
    }

    // Parse body
    const payload = JSON.parse(rawBody)
    const { event, content } = payload

    if (!event) {
      return NextResponse.json(
        { error: 'event field is required' },
        { status: 400 }
      )
    }

    // Record webhook event
    const tracker = getSyncTracker()
    const webhookEvent = await tracker.recordWebhookEvent(
      event,
      source,
      payload,
      content?.id
    )

    // Determine operation type from event
    let operationType: 'create' | 'update' | 'delete' = 'update'

    if (event.includes('created') || event.includes('create')) {
      operationType = 'create'
    } else if (event.includes('deleted') || event.includes('delete')) {
      operationType = 'delete'
    } else if (event.includes('updated') || event.includes('update')) {
      operationType = 'update'
    }

    // Process content if provided
    if (content) {
      try {
        const cmsContent: CMSContent = {
          id: content.id,
          type: content.type || 'page',
          title: content.title,
          content: content.content,
          url: content.url,
          metadata: content.metadata
        }

        const pipeline = getSyncPipeline()
        const operation = await pipeline.processSingleContent(
          cmsContent,
          operationType
        )

        // Mark webhook as processed
        await tracker.markWebhookProcessed(webhookEvent.id, operation.id)

        return NextResponse.json({
          success: true,
          message: `Content ${operationType} processed successfully`,
          webhookEventId: webhookEvent.id,
          operationId: operation.id
        })
      } catch (error) {
        console.error('Content processing error:', error)

        // Mark webhook as processed with error
        await tracker.markWebhookProcessed(
          webhookEvent.id,
          undefined,
          error instanceof Error ? error.message : 'Processing failed'
        )

        return NextResponse.json(
          {
            error: error instanceof Error ? error.message : 'Failed to process content',
            webhookEventId: webhookEvent.id
          },
          { status: 500 }
        )
      }
    }

    // If no content, just acknowledge receipt
    await tracker.markWebhookProcessed(webhookEvent.id)

    return NextResponse.json({
      success: true,
      message: 'Webhook received',
      webhookEventId: webhookEvent.id
    })
  } catch (error) {
    console.error('Webhook receiver error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/webhooks/cms
 *
 * Health check endpoint for webhook receiver
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'CMS webhook receiver is operational',
    supportedSources: ['wordpress', 'contentful']
  })
}
