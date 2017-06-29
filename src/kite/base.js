import dnode from 'dnode-protocol'
import WebSocket from 'ws'
import atob from 'atob'
import uuid from 'uuid'
import Emitter from './emitter'
import now from './now'
import backoff from './backoff'
import wrap from './wrap'
import handleIncomingMessage from './handleIncomingMessage'
import enableLogging from './enableLogging'
import Timeout from './timeout'
import KiteError from './error'
import MessageScrubber from './messagescrubber'
import { Event, AuthType, Defaults, TimerHandles, State } from '../constants'

class Kite extends Emitter {
  static version = Defaults.KiteInfo.version
  static Error = KiteError
  static transportClass = WebSocket

  static defaultOptions = {
    autoConnect: true,
    autoReconnect: true,
    prefix: '',
    transportClass: Kite.transportClass,
    transportOptions: {},
  }

  constructor(options = {}) {
    options = typeof options === 'string' ? { url: options } : options
    super()

    this.id = uuid.v4()
    this.options = Object.assign({}, Kite.defaultOptions, options)

    if (this.options.url && this.options.prefix) {
      this.options.url += this.options.prefix
    }

    enableLogging(this.options.name, this, this.options.logLevel)

    // refresh expired tokens
    this.expireTokenOnExpiry()

    this.readyState = State.NOTREADY

    this.proto = dnode(wrap.call(this, this.options.api))
    this.messageScrubber = new MessageScrubber({ kite: this })

    this.proto.on(Event.request, req => {
      this.ready(() => this.ws.send(JSON.stringify(req)))
      this.emit(Event.debug, 'Sending: ', JSON.stringify(req))
    })

    if (this.options.autoReconnect) {
      this.initBackoff()
    }

    if (this.options.autoConnect) {
      this.connect()
    }
  }

  getToken() {
    return this.options.auth.key
  }

  setToken(token) {
    // FIXME: this setter is not symettrical with the getter
    const { auth } = this.options

    if (auth && auth === AuthType.token) {
      throw new Error('Invalid auth type!')
    }

    if (!auth) {
      throw new Error('Auth option must be set before setting a token')
    }

    auth.key = token
    return this.emit(Event.tokenSet, token)
  }

  canConnect() {
    return ![State.CONNECTING, State.READY].includes(this.readyState)
  }

  connect() {
    if (!this.canConnect()) {
      return
    }
    this.readyState = State.CONNECTING
    const { url, transportClass: Konstructor, transportOptions } = this.options

    // websocket will whine if extra arguments are passed
    this.ws = Konstructor === WebSocket
      ? new Konstructor(url)
      : new Konstructor(url, null, transportOptions)
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
    this.emit(Event.notice, `Connected to Kite: ${this.options.url}`)
    if (typeof this.clearBackoffTimeout === 'function') {
      this.clearBackoffTimeout()
    }
    this.emit(Event.open)
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
    const { username, environment, version, region, hostname } = this.options

    const name = Array.isArray(params) && params[0]
      ? params[0].kiteName
      : this.options.name

    return {
      id: this.id,
      username: username || Defaults.KiteInfo.username,
      environment: environment || Defaults.KiteInfo.environment,
      name: name || Defaults.KiteInfo.name,
      version: version || Defaults.KiteInfo.version,
      region: region || Defaults.KiteInfo.region,
      hostname: hostname || Defaults.KiteInfo.hostname,
    }
  }

  tell(method, params, callback) {
    const scrubbed = this.messageScrubber.scrub(method, params, callback)
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

Kite.prototype.initBackoff = backoff

export default Kite
