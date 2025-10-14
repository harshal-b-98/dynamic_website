/**
 * Health Check Endpoint (Kubernetes convention)
 *
 * Alias for /api/health endpoint
 * Commonly used by Kubernetes, Docker, and other orchestration systems
 */

export { GET, HEAD } from '../health/route'
