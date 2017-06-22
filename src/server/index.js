import Promise from 'bluebird'
import Emitter from '../kite/emitter'
import dnodeProtocol from 'dnode-protocol'

import streamToArray from 'stream-to-array'
import fs from 'fs'
import { hostname } from 'os'
import { join as joinPath } from 'path'

import KiteError from '../kite/error'
import Kontrol from '../kontrol'
import Logger from '../kite/Logger'
import handleIncomingMessage from '../kite/handleIncomingMessage'
import { v4 as createId } from 'uuid'
import { getKontrolClaims } from '../kite/claims'
import { Defaults } from '../constants'

import DefaultApi from './default-api'
import WebSocketServer from './websocket'

const toArray = Promise.promisify(streamToArray)
const { readFileAsync } = Promise.promisifyAll(fs)

class KiteServer extends Emitter {
  constructor(options = {}) {
    super()

    this.options = options

    if (this.options.hostname == null) {
      this.options.hostname = hostname()
    }

    this.logger = new Logger({
      name: options.name || 'kite',
      level: options.logLevel,
    })

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
      this.api = DefaultApi
    }

    if (typeof fn === 'function') {
      func = fn
    } else if (typeof fn.func === 'function') {
      ;({ func, auth } = fn)
    } else {
      throw new Error(
        `Argument must be a function or an object with a func property`
      )
    }

    func.mustAuth = (left = auth != null ? auth : this.options.auth) != null
      ? left
      : true

    return (this.api[methodName] = func)
  }

  methods(methods) {
    const result = []
    for (let methodName in methods) {
      const fn = methods[methodName]
      result.push(this.method(methodName, fn))
    }
    return result
  }

  getServerClass() {
    return this.options.serverClass != null
      ? this.options.serverClass
      : WebSocketServer
  }

  getPrefix() {
    let { prefix } = this.options
    if (prefix == null) {
      prefix = ''
    }
    if (prefix.length && prefix.charAt(0) !== '/') {
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
    const { name, logLevel } = this.options
    const Server = this.getServerClass()
    this.server = new Server({ port, prefix, name, logLevel })
    this.server.on('connection', this.bound('onConnection'))
    this.logger.info(`Listening: ${this.server.getAddress()}`)
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
          this.logger.info('Connected to Kontrol')
        })
        .on('error', err => {
          this.emit('error', err)
          this.logger.error(err)
        })

      const kiteURL = `${scheme}://${host}:${this.port}/${this.options.name}`

      return this.kontrol.register({ url: kiteURL }).then(() => {
        this.logger.info(`Registered to Kontrol with URL: ${kiteURL}`)
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
    this.logger.debug(`Sending: ${messageStr}`)
    return ws.send(messageStr)
  }

  onConnection(ws) {
    const proto = dnodeProtocol(this.api)
    proto.on('request', this.lazyBound('handleRequest', ws))

    const id = ws.getId()
    ws.on('message', this.lazyBound('handleMessage', proto))
    ws.on('close', () => {
      this.logger.info(`Client has disconnected: ${id}`)
    })

    this.logger.info(`New connection from: ${id}`)
  }
}

KiteServer.prototype.normalizeKiteKey = Promise.method(
  (src = this.defaultKiteKey(), enc = 'utf-8') => {
    switch (false) {
      case typeof src !== 'string':
        return readFileAsync(src, enc).catch(
          KiteError.codeIs('ENOENT'),
          err => (err ? console.error(err) : src)
        )
      case typeof src.pipe !== 'function':
        return toArray(src).then(arr => arr.join('\n'))
      default:
        throw new Error(`Don't know how to normalize the kite key: ${src}`)
    }
  }
)

KiteServer.prototype.handleMessage = handleIncomingMessage
KiteServer.version = Defaults.KiteInfo.version

export default KiteServer
