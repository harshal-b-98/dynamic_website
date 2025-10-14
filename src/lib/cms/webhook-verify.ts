/**
 * Webhook Verification
 *
 * Utilities for verifying webhook signatures from CMS platforms
 */

import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Verify webhook signature using HMAC-SHA256
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    return false
  }

  try {
    // Remove prefix if present (e.g., "sha256=")
    const cleanSignature = signature.replace(/^sha256=/, '')

    // Generate expected signature
    const expectedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    // Use timing-safe comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(cleanSignature, 'hex')
    const expectedBuffer = Buffer.from(expectedSignature, 'hex')

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false
    }

    return timingSafeEqual(signatureBuffer, expectedBuffer)
  } catch (error) {
    console.error('Webhook signature verification error:', error)
    return false
  }
}

/**
 * Verify WordPress webhook signature
 */
export function verifyWordPressSignature(
  payload: string,
  signature: string | null
): boolean {
  const secret = process.env.WORDPRESS_WEBHOOK_SECRET || ''
  if (!secret) {
    throw new Error('WORDPRESS_WEBHOOK_SECRET environment variable is not set')
  }

  return verifyWebhookSignature(payload, signature, secret)
}

/**
 * Verify Contentful webhook signature
 */
export function verifyContentfulSignature(
  payload: string,
  signature: string | null
): boolean {
  const secret = process.env.CONTENTFUL_WEBHOOK_SECRET || ''
  if (!secret) {
    throw new Error('CONTENTFUL_WEBHOOK_SECRET environment variable is not set')
  }

  return verifyWebhookSignature(payload, signature, secret)
}

/**
 * Get verification function based on source
 */
export function getVerificationFunction(source: string): (payload: string, signature: string | null) => boolean {
  switch (source.toLowerCase()) {
    case 'wordpress':
      return verifyWordPressSignature
    case 'contentful':
      return verifyContentfulSignature
    default:
      throw new Error(`Unknown webhook source: ${source}`)
  }
}

/**
 * Validate webhook timestamp to prevent replay attacks
 */
export function validateWebhookTimestamp(
  timestamp: string | number,
  maxAgeSeconds = 300 // 5 minutes
): boolean {
  try {
    const webhookTime = typeof timestamp === 'string'
      ? parseInt(timestamp, 10)
      : timestamp

    const currentTime = Math.floor(Date.now() / 1000)
    const age = currentTime - webhookTime

    return age >= 0 && age <= maxAgeSeconds
  } catch (error) {
    console.error('Timestamp validation error:', error)
    return false
  }
}
