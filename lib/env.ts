// Environment variable validation
export const validateEnv = () => {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing)
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  // Validate URLs
  try {
    new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!)
    new URL(process.env.NEXTAUTH_URL!)
  } catch {
    throw new Error('Invalid URL format in environment variables')
  }

  return true
}

// Check environment on client side
export const checkClientEnv = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are missing on client side')
    return false
  }

  // Validate URLs on client
  try {
    new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  } catch {
    console.error('Invalid Supabase URL format')
    return false
  }

  return true
}

// Get environment-specific configuration
export const getEnvConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production'
  const isStaging = process.env.APP_URL?.includes('staging') || false

  return {
    isProduction,
    isStaging,
    isDevelopment: !isProduction && !isStaging,
    appUrl: process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000',
  }
}