import { createClient } from '@supabase/supabase-js'

// Types for your database
export type Database = {
  public: {
    Tables: {
      users: any
      sme_profiles: any
      compliance_tasks: any
      sme_compliance_status: any
      admin_users: any
      platform_settings: any
    }
  }
}

// Singleton pattern to prevent multiple instances
let browserClient: ReturnType<typeof createClient<Database>> | null = null

// Client-side client for browser requests
export const createBrowserClient = () => {
  if (browserClient) {
    return browserClient
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Supabase environment variables are not set')
  }

  browserClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      }
    }
  )

  return browserClient
}

// Server-side client for authenticated requests
export const createServerClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase environment variables are not set')
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}