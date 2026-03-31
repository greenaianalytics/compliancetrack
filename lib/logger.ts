import { getEnvConfig } from './env'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  data?: any
  timestamp: string
  context?: string
}

class Logger {
  private isProduction: boolean

  constructor() {
    this.isProduction = getEnvConfig().isProduction
  }

  private formatMessage(level: LogLevel, message: string, context?: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? `[${context}] ` : ''
    const dataStr = data ? ` ${JSON.stringify(data)}` : ''
    return `${timestamp} ${level.toUpperCase()}: ${contextStr}${message}${dataStr}`
  }

  private log(level: LogLevel, message: string, context?: string, data?: any) {
    const formattedMessage = this.formatMessage(level, message, context, data)

    if (this.isProduction) {
      // In production, you might want to send logs to a service like DataDog, Sentry, etc.
      // For now, we'll still log to console but could be enhanced
      console[level](formattedMessage)
    } else {
      // In development, use console with appropriate level
      console[level](formattedMessage)
    }
  }

  debug(message: string, context?: string, data?: any) {
    this.log('debug', message, context, data)
  }

  info(message: string, context?: string, data?: any) {
    this.log('info', message, context, data)
  }

  warn(message: string, context?: string, data?: any) {
    this.log('warn', message, context, data)
  }

  error(message: string, context?: string, data?: any) {
    this.log('error', message, context, data)
  }
}

export const logger = new Logger()

// Convenience functions for backward compatibility
export const logDebug = (message: string, context?: string, data?: any) => logger.debug(message, context, data)
export const logInfo = (message: string, context?: string, data?: any) => logger.info(message, context, data)
export const logWarn = (message: string, context?: string, data?: any) => logger.warn(message, context, data)
export const logError = (message: string, context?: string, data?: any) => logger.error(message, context, data)