Timeout = require './timeout'

module.exports = (options = {}) ->

  backoff = options.backoff ? {}
  totalReconnectAttempts = 0
  initalDelayMs = backoff.initialDelayMs ? 700
  multiplyFactor = backoff.multiplyFactor ? 1.4
  maxDelayMs = backoff.maxDelayMs ? 1000 * 15 # 15 seconds
  maxReconnectAttempts = backoff.maxReconnectAttempts ? 50

  @clearBackoffTimeout = ->
    totalReconnectAttempts = 0

  @clearBackoffHandle = ->
    if @backoffHandle?
      @backoffHandle.clear()
      @backoffHandle = null

  @setBackoffTimeout = (fn) =>
    @clearBackoffHandle()
    if totalReconnectAttempts < maxReconnectAttempts
      timeout = Math.min initalDelayMs * Math.pow(
        multiplyFactor, totalReconnectAttempts
      ), maxDelayMs
      @backoffHandle = new Timeout fn, timeout
      totalReconnectAttempts++
    else
      @emit "backoffFailed"

