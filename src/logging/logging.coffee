color = require 'cli-color'

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

  createLogger = (category, style, fn) -> (messages...) ->
    fn style "[#{ name }] #{ category }\t#{ messages.join ' ' }"

  if CRITICAL <= logLevel
    emitter.on 'critical', createLogger 'CRITICAL', color.red, error

  if ERROR <= logLevel
    emitter.on 'error', createLogger 'ERROR', color.red, error

  if WARNING <= logLevel
    emitter.on 'warning', createLogger 'WARN', color.yellow, warn

  if NOTICE <= logLevel
    emitter.on 'notice', createLogger 'NOTICE', color.green, info

  if INFO <= logLevel
    emitter.on 'info', createLogger 'INFO', color.white, info

  if DEBUG <= logLevel
    emitter.on 'debug', createLogger 'DEBUG', color.cyan, info

enableLogging.logLevels = {
  CRITICAL
  ERROR
  WARNING
  NOTICE
  INFO
  DEBUG
}

module.exports = enableLogging
