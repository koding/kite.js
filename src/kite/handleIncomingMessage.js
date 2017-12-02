import parse from 'try-json-parse'
import handleAuth from './auth'
import KiteError from './error'
import { Event } from '../constants'

export default function handleIncomingMessage(proto, message) {
  this.logger.debug(`Receiving: ${message}`)

  if (typeof message === 'string') {
    message = parse(message)
  }

  const req = message

  if (req == null) {
    this.logger.warning(`Invalid payload! (${message})`)
    return
  }

  if (!isKiteReq(req)) {
    this.logger.debug('Handling a normal dnode message')
    return proto.handle(req)
  }

  const { links, method, callbacks } = req
  const { authentication: auth, responseCallback } = parseKiteReq(req)

  this.logger.debug('Authenticating request')

  return handleAuth(this, method, auth, this.key)
    .then(token => {
      this.logger.debug('Authentication passed')

      // set this as the current token for the duration of the synchronous
      // method call.
      // NOTE: this mechanism may be changed at some point in the future.
      this.currentToken = token

      try {
        proto.handle(req)
      } catch (err) {
        this.logger.debug('Error processing request', err)
        proto.handle(
          getTraceReq({
            kite: this.getKiteInfo(),
            err,
            responseCallback,
            links,
            callbacks,
          })
        )
      }

      this.currentToken = null
      return null
    })
    .catch(err => {
      this.logger.debug('Authentication failed', err)

      proto.handle(
        getTraceReq({
          kite: this.getKiteInfo(),
          err,
          responseCallback,
          links,
          callbacks,
        })
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
    arguments: [
      {
        withArgs: [{ error: o.err }],
        responseCallback: o.responseCallback,
        kite: o.kite,
      },
    ],
    links: o.links,
    callbacks: o.callbacks,
  }
}

const parseKiteReq = req => req.arguments[0]
