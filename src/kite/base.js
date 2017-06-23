import WebSocket from 'ws'
import atob from 'atob'
import uuid from 'uuid'
import Emitter from './emitter'
import now from './now'
import backoff from './backoff'
import handleIncomingMessage from './handleIncomingMessage'
import enableLogging from './enableLogging'
import Timeout from './timeout'
import KiteError from './error'
import MessageScrubber from './messagescrubber'
import createProto from './createProto'
import KiteInfo from './KiteInfo'
import Logger from './Logger'
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

    this.logger = new Logger({
      name: this.options.name || 'kite',
      level: this.options.logLevel,
    })

    // refresh expired tokens
    this.expireTokenOnExpiry()

    this.readyState = State.NOTREADY

    this.proto = createProto({
      kite: this,
      api: this.options.api,
    })

    this.messageScrubber = new MessageScrubber({ kite: this })

    this.proto.on(Event.request, req => {
      req = JSON.stringify(req)
      this.ready(() => this.transport.send(req))
      this.logger.debug('Sending: ', req)
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
    this.transport = Konstructor === WebSocket
      ? new Konstructor(url)
      : new Konstructor(url, null, transportOptions)
    this.transport.addEventListener(Event.open, this.bound('onOpen'))
    this.transport.addEventListener(Event.close, this.bound('onClose'))
    this.transport.addEventListener(Event.message, this.bound('onMessage'))
    this.transport.addEventListener(Event.error, this.bound('onError'))
    this.transport.addEventListener(Event.info, info => this.logger.info(info))
    this.logger.info(`Trying to connect to ${url}`)
  }

  cleanTimerHandles() {
    for (let handle of TimerHandles) {
      if (this[handle] != null) {
        this[handle].clear()
        this[handle] = null
      }
    }
  }

  disconnect(reconnect = false) {
    this.cleanTimerHandles()

    // set reconnect to autoReconnect so that onClose handler can behave.
    // FIXME
    this.options.autoReconnect = !!reconnect
    if (this.transport != null) {
      this.transport.close()
    }

    this.logger.notice(`Disconnecting from ${this.options.url}`)
  }

  onOpen() {
    this.readyState = State.READY
    // FIXME: the following is ridiculous.
    this.logger.notice(`Connected to Kite: ${this.options.url}`)
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
    this.logger.info(dcInfo)
  }

  onMessage({ data }) {
    handleIncomingMessage.call(this, this.proto, data)
  }

  onError(err) {
    console.log(err)
    this.emit(Event.error, 'Websocket error!')
    this.logger.error('WebSocket error!')
  }

  getKiteInfo(params) {
    const { username, environment, version, region, hostname } = this.options

    const name = Array.isArray(params) && params[0]
      ? params[0].kiteName
      : undefined

    return new KiteInfo({
      id: this.id,
      username,
      environment,
      name,
      version,
      region,
      hostname,
    })
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
