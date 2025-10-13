/**
 * Vector Database Configuration and Validation
 *
 * Validates required environment variables and provides configuration
 * for the vector database client.
 */

export interface VectorDBConfig {
  supabaseUrl: string
  supabaseServiceKey: string
  supabaseAnonKey: string
  embedding: {
    dimensions: number
    model: string
  }
  search: {
    defaultThreshold: number
    defaultLimit: number
    maxLimit: number
  }
}

/**
 * Validate required environment variables
 * Throws descriptive errors if configuration is invalid
 */
export function validateVectorDBConfig(): void {
  const errors: string[] = []

  if (!process.env.SUPABASE_URL) {
    errors.push('SUPABASE_URL is not set in environment variables')
  } else if (!isValidSupabaseUrl(process.env.SUPABASE_URL)) {
    errors.push('SUPABASE_URL must be a valid Supabase URL (https://[project-id].supabase.co)')
  }

  if (!process.env.SUPABASE_SERVICE_KEY) {
    errors.push('SUPABASE_SERVICE_KEY is not set in environment variables')
  } else if (!isValidSupabaseKey(process.env.SUPABASE_SERVICE_KEY)) {
    errors.push('SUPABASE_SERVICE_KEY appears to be invalid (should start with "eyJ")')
  }

  if (!process.env.SUPABASE_ANON_KEY) {
    errors.push('SUPABASE_ANON_KEY is not set in environment variables')
  } else if (!isValidSupabaseKey(process.env.SUPABASE_ANON_KEY)) {
    errors.push('SUPABASE_ANON_KEY appears to be invalid (should start with "eyJ")')
  }

  if (errors.length > 0) {
    throw new Error(
      `Vector Database configuration is invalid:\n${errors.map(e => `  - ${e}`).join('\n')}\n\n` +
      'Please ensure all required Supabase environment variables are set in your .env.local file.'
    )
  }
}

/**
 * Get validated vector database configuration
 */
export function getVectorDBConfig(): VectorDBConfig {
  validateVectorDBConfig()

  return {
    supabaseUrl: process.env.SUPABASE_URL!,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY!,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
    embedding: {
      dimensions: 1536, // OpenAI ada-002 embedding dimensions
      model: 'text-embedding-ada-002'
    },
    search: {
      defaultThreshold: 0.7,
      defaultLimit: 10,
      maxLimit: 100
    }
  }
}

/**
 * Validate Supabase URL format
 */
function isValidSupabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      parsed.protocol === 'https:' &&
      parsed.hostname.endsWith('.supabase.co')
    )
  } catch {
    return false
  }
}

/**
 * Validate Supabase key format (JWT token)
 */
function isValidSupabaseKey(key: string): boolean {
  return key.startsWith('eyJ') && key.length > 100
}

/**
 * Check if vector database is properly configured
 * Returns boolean instead of throwing errors
 */
export function isVectorDBConfigured(): boolean {
  try {
    validateVectorDBConfig()
    return true
  } catch {
    return false
  }
}
