import { createBrowserClient } from './supabase'
import { debugLog, debugError, logError } from './debug'

// Helper to get the base URL (works on both server and client)
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side
    return window.location.origin
  }
  // Server-side - use environment variable with fallback
  return process.env.NEXT_PUBLIC_NEXTAUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
}

export const signIn = async (email: string, password: string) => {
  try {
    const supabase = createBrowserClient()
    
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    })

    if (error) {
      debugError('Auth:SignIn', error)
      throw error
    }

    debugLog('Auth:SignIn', 'Success')
    return { data, error: null }
  } catch (error: any) {
    logError('Auth:SignIn', error)
    return { data: null, error }
  }
}

export const signUp = async (email: string, password: string) => {
  try {
    const supabase = createBrowserClient()
    
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        emailRedirectTo: `${getBaseUrl()}/auth/callback`,
      },
    })

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    logError('Auth:SignUp', error)
    return { data: null, error }
  }
}

export const signOut = async () => {
  try {
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error: any) {
    logError('Auth:SignOut', error)
    return { error }
  }
}

export const getCurrentUser = async () => {
  try {
    const supabase = createBrowserClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Get user error:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

export const getSession = async () => {
  try {
    const supabase = createBrowserClient()
    
    if (!supabase) {
      console.error('Supabase client not initialized')
      return null
    }

    console.log('Getting session from Supabase...')
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Get session error:', error)
      return null
    }
    
    console.log('Session retrieved:', session ? 'Session exists' : 'No session')
    return session
  } catch (error) {
    console.error('Get session error:', error)
    return null
  }
}

export const resetPassword = async (email: string) => {
  try {
    const supabase = createBrowserClient()
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${getBaseUrl()}/reset-password`,
    })

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('Reset password error:', error)
    return { data: null, error }
  }
}