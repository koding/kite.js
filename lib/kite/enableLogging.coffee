[
  CRITICAL
  ERROR
  WARNING
  NOTICE
  INFO
  DEBUG
] = [0..5]

error = console.error.bind console
warn = console.warn.bind console
info = console.info.bind console

enableLogging = (name = "kite", emitter, logLevel = INFO) ->

  createLogger = (category, fn) -> (messages...) ->
    fn "[#{ name }] #{ category }\t#{ messages.join ' ' }"

  if CRITICAL <= logLevel
    emitter.on 'critical', createLogger 'CRITICAL', error

  if ERROR <= logLevel
    emitter.on 'error', createLogger 'ERROR', error

  if WARNING <= logLevel
    emitter.on 'warn', createLogger 'WARN', warn

  if NOTICE <= logLevel
    emitter.on 'notice', createLogger 'NOTICE', info

  if INFO <= logLevel
    emitter.on 'info', createLogger 'INFO', info

  if DEBUG <= logLevel
    emitter.on 'debug', createLogger 'DEBUG', info

module.exports = enableLogging

