function asObjectOf(list) {
  return list.reduce((events, event) => {
    events[event] = event
    return events
  }, {})
}

export const KnownEvents = [
  'backOffFailed',

  'tokenExpired',
  'tokenSet',

  'message',
  'request',

  'critical',
  'notice',
  'error',
  'warn',
  'info',
  'open',
  'debug',
]

export const Event = asObjectOf(KnownEvents)

export const KnownAuthTypes = ['token']
export const AuthType = asObjectOf(KnownAuthTypes)

export const TimerHandles = ['heartbeatHandle', 'expiryHandle', 'backoffHandle']
export const WhiteList = ['kite.heartbeat', 'kite.ping']

export const State = { NOTREADY: 0, READY: 1, CLOSED: 3, CONNECTING: 5 }

export const DebugLevel = {
  CRITICAL: 0,
  ERROR: 1,
  WARNING: 2,
  NOTICE: 3,
  INFO: 4,
  DEBUG: 5,
}

export const Backoff = {
  MAX_DELAY: 1000 * 15, // 15 seconds,
  MAX_RECONNECT_ATTEMPTS: 50,
  MULTIPLY_FACTOR: 1.4,
  INITIAL_DELAY: 700, // ms,
}

export const Defaults = {
  KiteInfo: {
    username: 'anonymous',
    environment: 'browser-environment',
    name: 'browser-kite',
    version: '1.0.0',
    region: 'browser-region',
    hostname: 'browser-hostname',
  },
}
