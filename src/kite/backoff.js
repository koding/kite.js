const Timeout = require('./timeout')

module.exports = function(options = {}) {
  const { backoff = {} } = options.backoff
  let totalReconnectAttempts = 0
  const initalDelayMs = backoff.initialDelayMs != null
    ? backoff.initialDelayMs
    : 700
  const multiplyFactor = backoff.multiplyFactor != null
    ? backoff.multiplyFactor
    : 1.4
  const maxDelayMs = backoff.maxDelayMs != null ? backoff.maxDelayMs : 1000 * 15 // 15 seconds
  const maxReconnectAttempts = backoff.maxReconnectAttempts != null
    ? backoff.maxReconnectAttempts
    : 50

  this.clearBackoffTimeout = () => (totalReconnectAttempts = 0)

  this.clearBackoffHandle = function() {
    if (this.backoffHandle != null) {
      this.backoffHandle.clear()
      return (this.backoffHandle = null)
    }
  }

  return (this.setBackoffTimeout = fn => {
    this.clearBackoffHandle()
    if (totalReconnectAttempts < maxReconnectAttempts) {
      const timeout = Math.min(
        initalDelayMs * Math.pow(multiplyFactor, totalReconnectAttempts),
        maxDelayMs
      )
      this.backoffHandle = new Timeout(fn, timeout)
      return totalReconnectAttempts++
    } else {
      return this.emit('backoffFailed')
    }
  })
}
