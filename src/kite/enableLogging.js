const [CRITICAL, ERROR, WARNING, NOTICE, INFO, DEBUG] = Array.from([0, 1, 2, 3, 4, 5])

const error = function (...args) {
  return console.error(...args)
}
const warn = function (...args) {
  return console.warn(...args)
}
const info = function (...args) {
  return console.info(...args)
}

const enableLogging = (name = 'kite', emitter, logLevel = INFO) => {
  const createLogger = (category, fn) => (...messages) => fn(`[${name}] ${category}\t${messages.join(' ')}`)

  if (CRITICAL <= logLevel) {
    emitter.on('critical', createLogger('CRITICAL', error))
  }

  if (ERROR <= logLevel) {
    emitter.on('error', createLogger('ERROR', error))
  }

  if (WARNING <= logLevel) {
    emitter.on('warn', createLogger('WARN', warn))
  }

  if (NOTICE <= logLevel) {
    emitter.on('notice', createLogger('NOTICE', info))
  }

  if (INFO <= logLevel) {
    emitter.on('info', createLogger('INFO', info))
  }

  if (DEBUG <= logLevel) {
    return emitter.on('debug', createLogger('DEBUG', info))
  }
}

module.exports = enableLogging
