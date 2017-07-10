import { DebugLevel } from './constants'

const defaults = {
  error: (...args) => console.error(...args),
  warn: (...args) => console.warn(...args),
  info: (...args) => console.info(...args),
}

export default class Logger {
  constructor(options = {}) {
    const {
      name,
      level = DebugLevel.INFO,
      error = defaults.error,
      warn = defaults.warn,
      info = defaults.info,
    } = options

    this.name = name
    this.level = level
    this.loggers = { error, warn, info }
  }

  logMessage(category, loggerType, ...args) {
    if (DebugLevel[category] <= this.level) {
      const fn = this.loggers
      this.loggers[loggerType](`[${this.name}]`, category, ...args)
    }
  }

  critical(...args) {
    this.logMessage('CRITICAL', 'error', ...args)
  }

  error(...args) {
    this.logMessage('ERROR', 'error', ...args)
  }

  warning(...args) {
    this.logMessage('WARNING', 'warn', ...args)
  }

  notice(...args) {
    this.logMessage('NOTICE', 'info', ...args)
  }

  info(...args) {
    this.logMessage('INFO', 'info', ...args)
  }

  debug(...args) {
    this.logMessage('DEBUG', 'info', ...args)
  }
}
