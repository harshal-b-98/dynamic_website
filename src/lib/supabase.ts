import { createClient } from '@supabase/supabase-js'

// Supabase client configuration
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// Service role client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Anonymous client for client-side operations (respects RLS)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
})

// Database types
export interface DynConversation {
  id: string
  session_id: string
  user_id?: string
  title?: string
  created_at: string
  updated_at: string
  metadata: Record<string, any>
}

export interface DynMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
  metadata: Record<string, any>
}

export interface DynSession {
  id: string
  session_id: string
  user_id?: string
  data: Record<string, any>
  created_at: string
  updated_at: string
  expires_at?: string
}
