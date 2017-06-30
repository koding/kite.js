import parse from 'try-json-parse'
import handleAuth from './auth'
import KiteError from './error'
import { Event } from '../constants'

export default function handleIncomingMessage(proto, message) {
  let responseCallback
  let withArgs
  this.emit(Event.debug, `Receiving: ${message}`)

  const req = parse(message)

  if (req == null) {
    this.emit(Event.warning, new KiteError(`Invalid payload! (${message})`))
    return
  }

  let { arguments: args, links, callbacks, method, authentication: auth } = req

  if (args.length > 0) {
    const [firstArg] = Array.from(args)
    withArgs = firstArg.withArgs
    responseCallback = firstArg.responseCallback
    auth = firstArg.authentication
  }

  if (withArgs == null && responseCallback == null) {
    this.emit(Event.debug, 'Handling a normal dnode message')
    return proto.handle(req)
  }

  this.emit(Event.debug, 'Authenticating request')

  return handleAuth(this, method, auth, this.key)
    .then(
      function(token) {
        this.emit(Event.debug, 'Authentication passed')

        if (withArgs == null) {
          withArgs = []
        }

        if (!Array.isArray(withArgs)) {
          withArgs = [withArgs]
        }

        mungeCallbacks(callbacks, withArgs.length)

        // set this as the current token for the duration of the synchronous
        // method call.
        // NOTE: this mechanism may be changed at some point in the future.
        this.currentToken = token

        proto.handle({
          method,
          arguments: [...Array.from(withArgs), responseCallback],
          links,
          callbacks,
        })

        return (this.currentToken = null)
      }.bind(this)
    )
    .catch(
      function(err) {
        this.emit(Event.debug, 'Authentication failed', err)

        mungeCallbacks(callbacks, 1)

        return proto.handle({
          method: 'kite.echo',
          arguments: [err, responseCallback],
          links,
          callbacks,
        })
      }.bind(this)
    )
}

const isKiteReq = req =>
  req.arguments.length &&
  req.arguments[0] &&
  req.arguments[0].responseCallback &&
  req.arguments[0].withArgs

const parseKiteReq = req => req.arguments[0]

const isResponseCallback = callback =>
  callback[0] === '0' && callback[1] === 'responseCallback'

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
