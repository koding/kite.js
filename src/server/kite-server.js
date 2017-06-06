let KiteServer
const SockJS = require('node-sockjs-client')

const EventEmitter = require('../event-emitter.coffee')

module.exports = KiteServer = (() => {
  let Promise
  let dnodeProtocol
  let toArray
  let fs
  let KiteError
  let Kontrol
  let enableLogging
  KiteServer = class KiteServer extends EventEmitter {
    static initClass() {
      ;({ version: this.version } = require('../../package.json'))

      Promise = require('bluebird')
      dnodeProtocol = require('dnode-protocol')
      toArray = Promise.promisify(require('stream-to-array'))
      fs = Promise.promisifyAll(require('fs'))
      const { join: joinPath } = require('path')

      KiteError = require('../error.coffee')
      Kontrol = require('../kontrol-as-promised/kontrol.coffee')

      enableLogging = require('../logging/logging.coffee')

      const { v4: createId } = require('node-uuid')

      this.serverClass = require('./websocket/server.coffee')

      const { getKontrolClaims } = require('../util.coffee')

      this.prototype.normalizeKiteKey = Promise.method(
        (src = this.defaultKiteKey(), enc = 'utf-8') => {
          switch (false) {
            case typeof src !== 'string':
              return fs
                .readFileAsync(src, enc)
                .catch(KiteError.codeIs('ENOENT'), err => src)
            case typeof src.pipe !== 'function':
              return toArray(src).then(arr => arr.join('\n'))
            default:
              throw new Error(
                `\
Don't know how to normalize the kite key: ${src}\
`
              )
          }
        }
      )

      this.prototype.handleMessage = require('../incoming-message-handler.coffee')

      this.prototype.bound = require('../bound.coffee')
    }

    constructor(options) {
      if (!(this instanceof KiteServer)) {
        return new KiteServer(api)
      }
      this.options = options

      if (this.options.hostname == null) {
        this.options.hostname = require('os').hostname()
      }

      enableLogging(options.name, this, options.logLevel)

      this.id = createId()
      this.server = null

      if (options.api != null) {
        this.methods(options.api)
      }

      this.currentToken = null
    }

    getToken() {
      return this.currentToken
    }

    method(methodName, fn) {
      let auth
      let func
      let left
      if (this.api == null) {
        this.api = require('./default-api.coffee')()
      }

      if (typeof fn === 'function') {
        func = fn
      } else if (typeof fn.func === 'function') {
        ;({ func, auth } = fn)
      } else {
        throw new Error(
          `\
Argument must be a function or an object with a func property\
`
        )
      }

      func.mustAuth = (left = auth != null ? auth : this.options.auth) != null
        ? left
        : true

      return (this.api[methodName] = func)
    }

    methods(methods) {
      return (() => {
        const result = []
        for (let methodName in methods) {
          const fn = methods[methodName]
          result.push(this.method(methodName, fn))
        }
        return result
      })()
    }

    getServerClass() {
      return this.options.serverClass != null
        ? this.options.serverClass
        : this.constructor.serverClass
    }

    getPrefix() {
      let { prefix } = this.options
      if (prefix == null) {
        prefix = ''
      }
      if (prefix.charAt(0) !== '/') {
        prefix = `/${prefix}`
      }
      return prefix
    }

    listen(port) {
      if (this.server != null) {
        throw new Error('Already listening!')
      }
      this.port = port
      const prefix = this.getPrefix()
      const Server = this.getServerClass()
      this.server = new Server({ port, prefix })
      this.server.on('connection', this.bound('onConnection'))
      return this.emit('info', `Listening: ${this.server.getAddress()}`)
    }

    close() {
      if (this.server != null) {
        this.server.close()
      }
      this.server = null
      if (this.kontrol != null) {
        this.kontrol.disconnect()
      }
      return (this.kontrol = null)
    }

    register({ kontrolURL: u, host: h, kiteKey: k }) {
      if (this.kontrol != null) {
        throw new Error('Already registered!')
      }
      const url = Promise.cast(u)
      const host = Promise.cast(h)
      const kiteKey = this.normalizeKiteKey(k)
      return Promise.join(url, host, kiteKey, (userKontrolURL, host, key) => {
        const {
          name,
          username,
          environment,
          version,
          region,
          hostname,
          logLevel,
          transportClass,
          secure,
        } = this.options

        const Server = this.getServerClass()

        const scheme =
          (secure === true ? Server.secureScheme : Server.scheme) || 'ws'

        if (key == null) {
          throw new Error('No kite key!')
        }

        this.key = key

        const { kontrolURL, sub: keyUsername } = getKontrolClaims(this.key)

        this.kontrol = new Kontrol({
          url: userKontrolURL != null ? userKontrolURL : kontrolURL,
          auth: { type: 'kiteKey', key },
          name,
          username: username != null ? username : keyUsername,
          environment,
          version,
          region,
          hostname,
          logLevel,
          transportClass,
        })
          .on('open', () => {
            return this.emit('info', 'Connected to Kontrol')
          })
          .on('error', err => {
            return this.emit('error', err)
          })

        const kiteURL = `${scheme}://${host}:${this.port}/${this.options.name}`

        return this.kontrol.register({ url: kiteURL }).then(() => {
          return this.emit('info', `Registered to Kontrol with URL: ${kiteURL}`)
        })
      })
    }

    defaultKiteKey() {
      const { HOME } = process.env
      if (HOME == null) {
        throw new Error("Couldn't find kite.key")
      }
      return joinPath(HOME, '.kite/kite.key')
    }

    onConnection(ws) {
      const proto = dnodeProtocol(this.api)
      proto.on('request', this.handleRequest.bind(this, ws))
      const id = ws.getId()
      ws.on('message', this.handleMessage.bind(this, proto))
      ws.on('close', () => {
        return this.emit('info', `Client has disconnected: ${id}`)
      })
      return this.emit('info', `New connection from: ${id}`)
    }

    handleRequest(ws, response) {
      const { arguments: args, method, callbacks, links } = response
      const [err, result] = Array.from(args)
      const message = { error: err, result }
      const messageStr = JSON.stringify({
        method,
        arguments: [message],
        links,
        callbacks,
      })
      this.emit('debug', `Sending: ${messageStr}`)
      return ws.send(messageStr)
    }
  }
  KiteServer.initClass()
  return KiteServer
})()
