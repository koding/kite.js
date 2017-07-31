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
    this.emit(Event.debug, 'Handling a normal dnode message', req)
    return proto.handle(req)
  }

  const auth = getRequestAuth(req)
  const responseCallback = getRequestCallback(req)

  return handleAuth(this, req.method, auth, this.key)
    .then(token => {
      this.emit(Event.debug, 'Authentication passed')

      // set this as the current token for the duration of the synchronous
      // method call.
      // NOTE: this mechanism may be changed at some point in the future.
      this.currentToken = token

      try {
        proto.handle(req)
      } catch (err) {
        this.emit(Event.debug, 'Error processing request', err)
        proto.handle(
          getTraceReq({
            err,
            responseCallback,
            links: req.links,
            callbacks: req.callbacks,
          })
        )
      }

      this.currentToken = null
      return null
    })
    .catch(err => {
      this.emit(Event.debug, 'Authentication failed', err)

      return proto.handle(
        getTraceReq({
          err,
          responseCallback,
          links: req.links,
          callbacks: req.callbacks,
        })
      )
    })
}

const isKiteReq = req =>
  req.arguments.length &&
  req.arguments[req.arguments.length - 1] &&
  req.arguments[req.arguments.length - 1].kite

const getTraceReq = o => {
  return {
    method: 'kite.echo',
    arguments: [o.err, o.responseCallback],
    links: o.links,
    callbacks: o.callbacks,
  }
}

const getRequestAuth = req =>
  req.arguments.length && req.arguments[req.arguments.length - 1].authentication

const getRequestCallback = req =>
  req.arguments.length && req.arguments[req.arguments.length - 2]
