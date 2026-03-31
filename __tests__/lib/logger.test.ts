import { logger } from '@/lib/logger'

// Mock console methods
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should log info messages', () => {
    logger.info('Test message', 'TestContext', { data: 'test' })

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('INFO: [TestContext] Test message {"data":"test"}')
    )
  })

  it('should log error messages', () => {
    const error = new Error('Test error')
    logger.error('Test error message', 'TestContext', error)

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('ERROR: [TestContext] Test error message')
    )
  })

  it('should log debug messages', () => {
    logger.debug('Debug message', 'TestContext')

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('DEBUG: [TestContext] Debug message')
    )
  })

  it('should log without context', () => {
    logger.info('Message without context')

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('INFO: Message without context')
    )
  })
})