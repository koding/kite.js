[
  CRITICAL
  ERROR
  WARNING
  NOTICE
  INFO
  DEBUG
] = [0,1,2,3,4,5]

error = console.error.bind console
warn = console.warn.bind console
info = console.info.bind console

color = require 'cli-color'

enableLogging = (name, emitter, logLevel = INFO) ->

  createLogger = (style, category, fn) -> (message) ->
    fn style "[#{ name }] #{ category }\t#{ message }"

  if CRITICAL <= logLevel
    emitter.on 'critical', createLogger color.cyan, 'CRITICAL', error

  if ERROR <= logLevel
    emitter.on 'error', createLogger color.red, 'ERROR', error

  if WARNING <= logLevel
    emitter.on 'warn', createLogger color.yellow, 'WARN', warn

  if NOTICE <= logLevel
    emitter.on 'notice', createLogger color.green, 'NOTICE', info

  if INFO <= logLevel
    emitter.on 'info', createLogger color.white, 'INFO', info

  if DEBUG <= logLevel
    emitter.on 'debug', createLogger color.cyan, 'DEBUG', info

enableLogging.logLevels = {
  CRITICAL
  ERROR
  WARNING
  NOTICE
  INFO
  DEBUG
}

module.exports = enableLogging
