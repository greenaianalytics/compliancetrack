import { NextRequest } from 'next/server'

// Input validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateRequired(value: any, fieldName: string): string | null {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`
  }
  return null
}

export function validateStringLength(value: string, min: number, max: number, fieldName: string): string | null {
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters`
  }
  if (value.length > max) {
    return `${fieldName} must be no more than ${max} characters`
  }
  return null
}

export function sanitizeString(value: string): string {
  return value.trim().replace(/[<>]/g, '')
}

export function validateRequestBody<T>(
  request: NextRequest,
  requiredFields: (keyof T)[],
  validators?: Partial<Record<keyof T, (value: any) => string | null>>
): { isValid: boolean; data?: T; errors: string[] } {
  const errors: string[] = []

  try {
    const body = request.body ? JSON.parse(request.body.toString()) : {}

    // Check required fields
    for (const field of requiredFields) {
      const error = validateRequired(body[field], field as string)
      if (error) {
        errors.push(error)
      }
    }

    // Run custom validators
    if (validators) {
      for (const [field, validator] of Object.entries(validators)) {
        if (body[field] !== undefined) {
          const error = validator(body[field])
          if (error) {
            errors.push(error)
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      data: errors.length === 0 ? body as T : undefined,
      errors
    }
  } catch (error) {
    return {
      isValid: false,
      errors: ['Invalid JSON in request body']
    }
  }
}

// Common validation schemas
export const validationSchemas = {
  login: {
    requiredFields: ['email', 'password'] as const,
    validators: {
      email: (value: string) => validateEmail(value) ? null : 'Invalid email format',
      password: (value: string) => validateStringLength(value, 6, 100, 'Password') ? validateStringLength(value, 6, 100, 'Password') : null
    }
  },

  signup: {
    requiredFields: ['email', 'password'] as const,
    validators: {
      email: (value: string) => validateEmail(value) ? null : 'Invalid email format',
      password: (value: string) => validateStringLength(value, 8, 100, 'Password') ? validateStringLength(value, 8, 100, 'Password') : null
    }
  },

  businessProfile: {
    requiredFields: ['business_name', 'business_address', 'country_code'] as const,
    validators: {
      business_name: (value: string) => validateStringLength(value, 2, 100, 'Business name'),
      business_address: (value: string) => validateStringLength(value, 10, 500, 'Business address')
    }
  }
}