const dnode = require('dnode-protocol')
const WebSocket = require('ws')
const atob = require('atob')
const uuid = require('uuid')
const Emitter = require('./emitter')
const now = require('./now')
const backoff = require('./backoff')
const wrap = require('./wrap')
const handleIncomingMessage = require('./handleIncomingMessage')
const enableLogging = require('./enableLogging')
const Timeout = require('./timeout')
const KiteError = require('./error')

const {
  TimerHandles,
  State: { NOTREADY, READY, CLOSED, CONNECTING },
} = require('../constants')

function __guard__(value, transform) {
  return typeof value !== 'undefined' && value !== null
    ? transform(value)
    : undefined
}

class Kite extends Emitter {
  constructor(options) {
    super()

    this.id = uuid.v4()
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

    this.readyState = NOTREADY

    if (this.options.autoReconnect) {
      this.initBackoff()
    }

    this.proto = dnode(wrap.call(this, this.options.api))

    this.proto.on('request', req => {
      this.ready(() => this.ws.send(JSON.stringify(req)))
      this.emit('debug', 'Sending: ', JSON.stringify(req))
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
    if (this.options.auth && this.options.auth === 'token') {
      throw new Error('Invalid auth type!')
    }
    this.options.auth.key = token
    return this.emit('tokenSet', token)
  }

  connect() {
    if ([CONNECTING, READY].includes(this.readyState)) {
      return
    }
    this.readyState = CONNECTING
    const { url, transportClass, transportOptions } = this.options
    const Konstructor = transportClass != null
      ? transportClass
      : this.constructor.transportClass
    const options = transportOptions != null
      ? transportOptions
      : this.constructor.transportOptions
    // websocket will whine if extra arguments are passed
    this.ws = Konstructor === WebSocket
      ? new Konstructor(url)
      : new Konstructor(url, null, options)
    this.ws.addEventListener('open', this.bound('onOpen'))
    this.ws.addEventListener('close', this.bound('onClose'))
    this.ws.addEventListener('message', this.bound('onMessage'))
    this.ws.addEventListener('error', this.bound('onError'))
    this.ws.addEventListener('info', info => this.emit('info', info))
    this.emit('info', `Trying to connect to ${url}`)
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
    this.emit('notice', `Disconnecting from ${this.options.url}`)
  }

  onOpen() {
    this.readyState = READY
    // FIXME: the following is ridiculous.
    this.emit('open')
    this.emit('notice', `Connected to Kite: ${this.options.url}`)
    if (typeof this.clearBackoffTimeout === 'function') {
      this.clearBackoffTimeout()
    }
  }

  onClose(event) {
    this.readyState = CLOSED
    this.emit('close', event)

    let dcInfo = `${this.options.url}: disconnected`
    // enable below to autoReconnect when the socket has been closed
    if (this.options.autoReconnect) {
      process.nextTick(() => this.setBackoffTimeout(this.bound('connect')))
      dcInfo += ', trying to reconnect...'
    }

    this.emit('info', dcInfo)
  }

  onMessage({ data }) {
    handleIncomingMessage.call(this, this.proto, data)
  }

  onError(err) {
    console.log(err)
    this.emit('error', 'Websocket error!')
  }

  getKiteInfo(params) {
    let left
    return {
      username: `${this.options.username != null ? this.options.username : 'anonymous'}`,
      environment: `${this.options.environment != null ? this.options.environment : 'browser-environment'}`,
      name: `${(left = __guard__(params != null ? params[0] : undefined, ({ kiteName }) => kiteName) != null ? __guard__(params != null ? params[0] : undefined, ({ kiteName }) => kiteName) : this.options.name) != null ? left : 'browser-kite'}`,
      version: `${this.options.version != null ? this.options.version : '1.0.0'}`,
      region: `${this.options.region != null ? this.options.region : 'browser-region'}`,
      hostname: `${this.options.hostname != null ? this.options.hostname : 'browser-hostname'}`,
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

    this.proto.emit('request', scrubbed)
  }

  expireTokenOnExpiry() {
    const { auth = {} } = this.options
    if (auth.type !== 'token') return

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
      this.once('tokenSet', newToken => callback(null, newToken))
    }
    this.emit('tokenExpired')
    if (this.expiryHandle) {
      this.expiryHandle.clear()
      this.expiryHandle = null
    }
  }

  ready(callback) {
    if (this.readyState === READY) {
      process.nextTick(callback)
    } else {
      this.once('open', callback)
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

Kite.version = '1.0.0'
Kite.Error = KiteError
Kite.transportClass = WebSocket
Kite.prototype.initBackoff = backoff

export default Kite
