import * as dnode from 'dnode-protocol'
import * as WebSocket from 'ws'
import atob from 'atob'
import { v4 as createId } from 'uuid'
import Emitter from './emitter'
import now from './now'
import backoff from './backoff'
import wrap from './wrap'
import handleIncomingMessage from './handleIncomingMessage'
import enableLogging from './enableLogging'
import Timeout from './timeout'
import KiteError from './error'

import { Event, AuthType, Defaults, TimerHandles, State } from '../constants'

function __guard__(value, transform) {
  return typeof value !== 'undefined' && value !== null
    ? transform(value)
    : undefined
}

class Kite extends Emitter {
  constructor(options) {
    super()

    this.id = createId()
    this.options = typeof options === 'string' ? { url: options } : options
    if (this.options.autoConnect == null) {
      this.options.autoConnect = true
    }
    if (this.options.autoReconnect == null) {
      this.options.autoReconnect = true
    }
    if (this.options.prefix) {
      this.options.url += this.options.prefix
    }

    enableLogging(this.options.name, this, this.options.logLevel)

    // refresh expired tokens
    this.expireTokenOnExpiry()

    this.readyState = State.NOTREADY

    if (this.options.autoReconnect) {
      this.initBackoff()
    }

    this.proto = dnode(wrap.call(this, this.options.api))

    this.proto.on(Event.request, req => {
      this.ready(() => this.ws.send(JSON.stringify(req)))
      this.emit(Event.debug, 'Sending: ', JSON.stringify(req))
    })

    if (this.options.autoConnect) {
      this.connect()
    }
  }

  getToken() {
    return this.options.auth.key
  }

  setToken(token) {
    // FIXME: this setter is not symettrical with the getter
    if (this.options.auth && this.options.auth === AuthType.token) {
      throw new Error('Invalid auth type!')
    }
    this.options.auth.key = token
    return this.emit(Event.tokenSet, token)
  }

  connect() {
    if ([State.CONNECTING, State.READY].includes(this.readyState)) {
      return
    }
    this.readyState = State.CONNECTING
    const { url, transportClass, transportOptions } = this.options
    const Konstructor = transportClass != null
      ? transportClass
      : Kite.transportClass
    const options = transportOptions != null
      ? transportOptions
      : this.constructor.transportOptions
    // websocket will whine if extra arguments are passed

    this.ws = Konstructor === WebSocket
      ? new Konstructor(url)
      : new Konstructor(url, null, options)
    this.ws.addEventListener(Event.open, this.bound('onOpen'))
    this.ws.addEventListener(Event.close, this.bound('onClose'))
    this.ws.addEventListener(Event.message, this.bound('onMessage'))
    this.ws.addEventListener(Event.error, this.bound('onError'))
    this.ws.addEventListener(Event.info, info => this.emit(Event.info, info))
    this.emit(Event.info, `Trying to connect to ${url}`)
  }

  disconnect(reconnect = false) {
    for (let handle of TimerHandles) {
      if (this[handle] != null) {
        this[handle].clear()
        this[handle] = null
      }
    }
    this.options.autoReconnect = !!reconnect
    if (this.ws != null) {
      this.ws.close()
    }
    this.emit(Event.notice, `Disconnecting from ${this.options.url}`)
  }

  onOpen() {
    this.readyState = State.READY
    // FIXME: the following is ridiculous.
    this.emit(Event.open)
    this.emit(Event.notice, `Connected to Kite: ${this.options.url}`)
    if (typeof this.clearBackoffTimeout === 'function') {
      this.clearBackoffTimeout()
    }
  }

  onClose(event) {
    this.readyState = State.CLOSED
    this.emit(Event.close, event)

    let dcInfo = `${this.options.url}: disconnected`
    // enable below to autoReconnect when the socket has been closed
    if (this.options.autoReconnect) {
      process.nextTick(() => this.setBackoffTimeout(this.bound('connect')))
      dcInfo += ', trying to reconnect...'
    }

    this.emit(Event.info, dcInfo)
  }

  onMessage({ data }) {
    handleIncomingMessage.call(this, this.proto, data)
  }

  onError(err) {
    console.log(err)
    this.emit(Event.error, 'Websocket error!')
  }

  getKiteInfo(params) {
    let left
    return {
      username: `${this.options.username != null
        ? this.options.username
        : Defaults.KiteInfo.username}`,
      environment: `${this.options.environment != null
        ? this.options.environment
        : Defaults.KiteInfo.environment}`,
      name: `${(left = __guard__(
        params != null ? params[0] : undefined,
        ({ kiteName }) => kiteName
      ) != null
        ? __guard__(
            params != null ? params[0] : undefined,
            ({ kiteName }) => kiteName
          )
        : this.options.name) != null
        ? left
        : Defaults.KiteInfo.name}`,
      version: `${this.options.version != null
        ? this.options.version
        : Defaults.KiteInfo.version}`,
      region: `${this.options.region != null
        ? this.options.region
        : Defaults.KiteInfo.region}`,
      hostname: `${this.options.hostname != null
        ? this.options.hostname
        : Defaults.KiteInfo.hostname}`,
      id: this.id,
    }
  }

  wrapMessage(method, params, callback) {
    return {
      kite: this.getKiteInfo(params),
      authentication: this.options.auth,
      withArgs: params,
      responseCallback(response) {
        const { error: rawErr, result } = response
        const err = rawErr != null ? KiteError.makeProperError(rawErr) : null

        return callback(err, result)
      },
    }
  }

  tell(method, params, callback) {
    // by default, remove this callback after it is called once.
    if (callback.times == null) {
      callback.times = 1
    }

    const scrubbed = this.proto.scrubber.scrub([
      this.wrapMessage(method, params, callback),
    ])
    scrubbed.method = method

    this.proto.emit(Event.request, scrubbed)
  }

  expireTokenOnExpiry() {
    const { auth = {} } = this.options
    if (auth.type !== AuthType.token) return

    const { auth: { key: token } } = this.options

    const claimsA = token.split('.')[1]

    const claims = (() => {
      try {
        return JSON.parse(atob(claimsA))
      } catch (error) {}
    })()

    if (claims != null ? claims.exp : undefined) {
      // the `exp` is measured in seconds since the UNIX epoch; convert to ms
      const expMs = claims.exp * 1000
      const nowMs = +now()
      // renew token before it expires:
      const earlyMs = 5 * 60 * 1000 // 5 min
      const renewMs = expMs - nowMs - earlyMs
      this.expiryHandle = new Timeout(this.bound('expireToken'), renewMs)
    }
  }

  expireToken(callback) {
    if (callback != null) {
      this.once(Event.tokenSet, newToken => callback(null, newToken))
    }
    this.emit(Event.tokenExpired)
    if (this.expiryHandle) {
      this.expiryHandle.clear()
      this.expiryHandle = null
    }
  }

  ready(callback) {
    if (this.readyState === State.READY) {
      process.nextTick(callback)
    } else {
      this.once(Event.open, callback)
    }
  }

  ping(callback) {
    return this.tell('kite.ping', callback)
  }

  static disconnect(...kites) {
    for (let kite of kites) {
      kite.disconnect()
    }
  }

  static random(kites) {
    return kites[Math.floor(Math.random() * kites.length)]
  }
}

Kite.version = Defaults.KiteInfo.version
Kite.Error = KiteError
Kite.transportClass = WebSocket
Kite.prototype.initBackoff = backoff

export default Kite
