import Timeout from './timeout'
import { Backoff, Event } from '../constants'

export default function backoff(options = {}) {
  const { backoff = {} } = options
  let totalReconnectAttempts = 0

  const {
    initialDelayMs = Backoff.INITIAL_DELAY,
    multiplyFactor = Backoff.MULTIPLY_FACTOR,
    maxDelayMs = Backoff.MAX_DELAY,
    maxReconnectAttempts = Backoff.MAX_RECONNECT_ATTEMPTS,
  } = backoff

  this.clearBackoffTimeout = () => (totalReconnectAttempts = 0)

  this.clearBackoffHandle = function() {
    if (this.backoffHandle != null) {
      this.backoffHandle.clear()
      this.backoffHandle = null
    }
  }

  this.setBackoffTimeout = fn => {
    this.clearBackoffHandle()
    if (totalReconnectAttempts < maxReconnectAttempts) {
      const timeout = Math.min(
        initialDelayMs * Math.pow(multiplyFactor, totalReconnectAttempts),
        maxDelayMs
      )
      this.backoffHandle = new Timeout(fn, timeout)
      return totalReconnectAttempts++
    } else {
      return this.emit(Event.backOffFailed)
    }
  }
}
