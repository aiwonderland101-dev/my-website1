import { createBrowserClient } from '@supabase/ssr'

// Development mode mock client
const createMockClient = () => {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
      signUp: async () => ({ data: { user: null, session: null }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: (callback: any) => {
        // Mock auth state changes
        return {
          data: { subscription: { unsubscribe: () => {} } }
        }
      }
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          limit: () => ({ data: [], error: null })
        })
      }),
      insert: () => ({
        select: () => ({ data: null, error: null })
      }),
      update: () => ({
        eq: () => ({ data: null, error: null })
      }),
      delete: () => ({
        eq: () => ({ data: null, error: null })
      })
    })
  }
}

export const createClient = () => {
  // Check if we're in development mode
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

  if (isDevMode) {
    console.warn('🔧 Using mock Supabase client for development. Set NEXT_PUBLIC_DEV_MODE=false and add real credentials for production.')
    return createMockClient()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('@supabase/ssr: Your project\'s URL and API key are required to create a Supabase client!\n\nCheck your Supabase project\'s API settings to find these values\n\nhttps://supabase.com/dashboard/project/_/settings/api')
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch {
    throw new Error('Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.')
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
