import { Event, DebugLevel } from '../constants'

const error = (...args) => console.error(...args)
const warn = (...args) => console.warn(...args)
const info = (...args) => console.info(...args)

const enableLogging = (name = 'kite', emitter, logLevel = DebugLevel.INFO) => {
  const createLogger = (category, fn) => (...messages) =>
    fn(`[${name}] ${category}\t${messages.join(' ')}`)

  if (DebugLevel.CRITICAL <= logLevel) {
    emitter.on(Event.critical, createLogger('CRITICAL', error))
  }

  if (DebugLevel.ERROR <= logLevel) {
    emitter.on(Event.error, createLogger('ERROR', error))
  }

  if (DebugLevel.WARNING <= logLevel) {
    emitter.on(Event.warn, createLogger('WARN', warn))
  }

  if (DebugLevel.NOTICE <= logLevel) {
    emitter.on(Event.notice, createLogger('NOTICE', info))
  }

  if (DebugLevel.INFO <= logLevel) {
    emitter.on(Event.info, createLogger('INFO', info))
  }

  if (DebugLevel.DEBUG <= logLevel) {
    return emitter.on(Event.debug, createLogger('DEBUG', info))
  }
}

export default enableLogging
