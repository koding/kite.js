module.exports = (options = {}) ->
  backoff = options.backoff ? {}
  totalReconnectAttempts = 0
  initalDelayMs = backoff.initialDelayMs ? 700
  multiplyFactor = backoff.multiplyFactor ? 1.4
  maxDelayMs = backoff.maxDelayMs ? 1000 * 15 # 15 seconds
  maxReconnectAttempts = backoff.maxReconnectAttempts ? 50

  @clearBackoffTimeout =->
    totalReconnectAttempts = 0

  @setBackoffTimeout = (fn)=>
    if totalReconnectAttempts < maxReconnectAttempts
      timeout = Math.min initalDelayMs * Math.pow(
        multiplyFactor, totalReconnectAttempts
      ), maxDelayMs
      setTimeout fn, timeout
      totalReconnectAttempts++
    else
      @emit "connectionFailed"