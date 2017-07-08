import parse from 'try-json-parse'
import handleAuth from './auth'
import KiteError from './error'
import { Event } from '../constants'

export default function handleIncomingMessage(proto, message) {
  this.emit(Event.debug, `Receiving: ${message}`)

  if (typeof message === 'string') {
    message = parse(message)
  }

  const req = message

  if (req == null) {
    this.emit(Event.warning, new KiteError(`Invalid payload! (${message})`))
    return
  }

  if (!isKiteReq(req)) {
    this.emit(Event.debug, 'Handling a normal dnode message')
    return proto.handle(req)
  }

  const { links, method, callbacks } = req
  const {
    withArgs = [],
    authentication: auth,
    responseCallback,
  } = parseKiteReq(req)

  this.emit(Event.debug, 'Authenticating request')

  return handleAuth(this, method, auth, this.key)
    .then(token => {
      this.emit(Event.debug, 'Authentication passed')

      // set this as the current token for the duration of the synchronous
      // method call.
      // NOTE: this mechanism may be changed at some point in the future.
      this.currentToken = token

      try {
        proto.handle(
          toProtoReq({
            method,
            withArgs,
            responseCallback,
            links,
            callbacks,
          })
        )
      } catch (err) {
        this.emit(Event.debug, 'Error processing request', err)
        proto.handle(getTraceReq({ err, responseCallback, links, callbacks }))
      }

      this.currentToken = null
      return null
    })
    .catch(err => {
      this.emit(Event.debug, 'Authentication failed', err)

      return proto.handle(
        getTraceReq({ err, responseCallback, links, callbacks })
      )
    })
}

const isKiteReq = req =>
  req.arguments.length &&
  req.arguments[0] &&
  req.arguments[0].responseCallback &&
  req.arguments[0].withArgs

const getTraceReq = o => {
  return {
    method: 'kite.echo',
    arguments: [o.err, o.responseCallback],
    links: o.links,
    callbacks: mungeCallbacks(o.callbacks, 1),
  }
}

const parseKiteReq = req => req.arguments[0]

const isResponseCallback = callback =>
  Array.isArray(callback) && callback.join('.') === '0.responseCallback'

const mungeCallbacks = (callbacks, n) => {
  // FIXME: this is an ugly hack; there must be a better way to implement it:

  for (let key of Object.keys(callbacks || {})) {
    const callback = callbacks[key]
    if (isResponseCallback(callback)) {
      callbacks[key] = [n]
    }
    if (callback[1] === 'withArgs') {
      // since we're rewriting the protocol for the withArgs case,
      // we need to remove everything up to withArgs
      callbacks[key] = callback.slice(2)
    }
  }

  return callbacks
}

const toProtoReq = ({
  method,
  withArgs,
  responseCallback,
  links,
  callbacks,
}) => {
  if (!Array.isArray(withArgs)) {
    withArgs = [withArgs]
  }

  mungeCallbacks(callbacks, withArgs.length)

  return {
    method,
    arguments: [...Array.from(withArgs), responseCallback],
    links,
    callbacks,
  }
}
