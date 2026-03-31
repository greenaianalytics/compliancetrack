import { NextRequest } from 'next/server'

// Simple in-memory rate limiter (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string // Function to generate rate limit key
}

export function rateLimit(options: RateLimitOptions) {
  return (request: NextRequest) => {
    const keyGenerator = options.keyGenerator || ((req) => req.ip || 'anonymous')
    const key = keyGenerator(request)

    const now = Date.now()
    const windowStart = now - options.windowMs

    // Clean up old entries
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.resetTime < windowStart) {
        rateLimitMap.delete(k)
      }
    }

    const current = rateLimitMap.get(key)

    if (!current || current.resetTime < windowStart) {
      // First request in window or window expired
      rateLimitMap.set(key, { count: 1, resetTime: now + options.windowMs })
      return { allowed: true, remaining: options.maxRequests - 1 }
    } else {
      // Within window
      if (current.count >= options.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: current.resetTime
        }
      } else {
        current.count++
        return {
          allowed: true,
          remaining: options.maxRequests - current.count
        }
      }
    }
  }
}

// Pre-configured rate limiters
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  keyGenerator: (req) => req.ip || 'anonymous'
})

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 auth attempts per 15 minutes
  keyGenerator: (req) => {
    // Use IP + email if available for auth endpoints
    const body = req.body ? JSON.parse(req.body.toString()) : {}
    return `${req.ip || 'anonymous'}-${body.email || 'no-email'}`
  }
})