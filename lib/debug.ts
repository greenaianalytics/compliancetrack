/**
 * Development-only logging utility
 * Logs are only written to console in development environment
 */

const isDev = process.env.NODE_ENV === 'development'

export const debugLog = (label: string, data?: any) => {
  if (isDev) {
    console.log(`[${label}]`, data)
  }
}

export const debugError = (label: string, error?: any) => {
  if (isDev) {
    console.error(`[${label}]`, error)
  }
}

export const debugWarn = (label: string, data?: any) => {
  if (isDev) {
    console.warn(`[${label}]`, data)
  }
}

/**
 * Always-on error logging (for production debugging)
 * Use for critical errors that should always be logged
 */
export const logError = (label: string, error: any) => {
  console.error(`[${label}]`, error)
}

/**
 * Sanitize sensitive data from logs
 */
export const sanitize = (data: any): any => {
  if (!data) return data
  
  if (typeof data === 'string') {
    return data
      .replace(/password['":\s=]+[^\s,}]+/gi, 'password=***')
      .replace(/token['":\s=]+[^\s,}]+/gi, 'token=***')
      .replace(/key['":\s=]+[^\s,}]+/gi, 'key=***')
  }
  
  if (typeof data === 'object') {
    const sanitized = { ...data }
    if ('password' in sanitized) sanitized.password = '***'
    if ('token' in sanitized) sanitized.token = '***'
    if ('secret' in sanitized) sanitized.secret = '***'
    if ('api_key' in sanitized) sanitized.api_key = '***'
    return sanitized
  }
  
  return data
}
