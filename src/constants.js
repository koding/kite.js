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

const [NOTREADY, READY, CLOSED, CONNECTING] = Array.from([0, 1, 3, 5])
export const State = { NOTREADY, READY, CLOSED, CONNECTING }

const [CRITICAL, ERROR, WARNING, NOTICE, INFO, DEBUG] = Array.from(
  Array(6).keys()
)
export const DebugLevel = { CRITICAL, ERROR, WARNING, NOTICE, INFO, DEBUG }
