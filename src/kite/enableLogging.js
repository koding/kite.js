const {
  Event,
  DebugLevel: { CRITICAL, ERROR, WARNING, NOTICE, INFO, DEBUG },
} = require('../constants')

const error = (...args) => console.error(...args)
const warn = (...args) => console.warn(...args)
const info = (...args) => console.info(...args)

export default (name = 'kite', emitter, logLevel = INFO) => {
  const createLogger = (category, fn) => (...messages) =>
    fn(`[${name}] ${category}\t`, ...messages)

  if (CRITICAL <= logLevel) {
    emitter.on(Event.critical, createLogger('CRITICAL', error))
  }

  if (ERROR <= logLevel) {
    emitter.on(Event.error, createLogger('ERROR', error))
  }

  if (WARNING <= logLevel) {
    emitter.on(Event.warn, createLogger('WARN', warn))
  }

  if (NOTICE <= logLevel) {
    emitter.on(Event.notice, createLogger('NOTICE', info))
  }

  if (INFO <= logLevel) {
    emitter.on(Event.info, createLogger('INFO', info))
  }

  if (DEBUG <= logLevel) {
    return emitter.on(Event.debug, createLogger('DEBUG', info))
  }
}
