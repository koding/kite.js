import Emitter from '../kite/emitter'

import parse from 'try-json-parse'

import { hostname } from 'os'

import Kite from '../kite'

import handleIncomingMessage from '../kite/handleIncomingMessage'
import { v4 as createId } from 'uuid'
import { Defaults } from '../constants'

import WebSocketServer from './websocket'
import SockJSServer from './sockjs'

import KiteApi from '../KiteApi'
import KiteLogger from '../KiteLogger'

class KiteServer extends Emitter {
  static version = Defaults.KiteInfo.version
  static transport = {
    WebSocket: WebSocketServer,
    SockJS: SockJSServer,
  }

  constructor(options = {}) {
    super()

    this.options = options

    if (this.options.hostname == null) {
      this.options.hostname = hostname()
    }

    this.logger = new KiteLogger({
      name: options.name || 'kite',
      level: options.logLevel,
    })

    this.id = createId()
    this.server = null

    this.api = new KiteApi({
      auth: this.options.auth,
      methods: this.options.api,
    })

    this.currentToken = null
  }

  getToken() {
    return this.currentToken
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
    const proto = this.api.makeProto()
    proto.on('request', this.lazyBound('handleRequest', ws))

    const id = ws.getId()

    let transportClass = Kite.transport.WebSocket
    if (this.options.serverClass === SockJSServer) {
      transportClass = Kite.transport.SockJS
    }
    ws.kite = new Kite({
      url: id,
      name: `${this.options.name}-remote`,
      logLevel: this.options.logLevel,
      autoConnect: false,
      autoReconnect: false,
      transportClass,
    })

    ws.kite.ws = ws
    ws.kite.onOpen()

    ws.on('message', rawData => {
      const message = parse(rawData)
      if (this.api.hasMethod(message.method)) {
        this.handleMessage(proto, message, ws.kite)
      } else {
        if (message.arguments.length === 2) {
          let [error, result] = message.arguments
          message.arguments = [{ error, result }]
        }
        this.handleMessage.call(ws.kite, ws.kite.api.proto, message)
      }
    })

    ws.on('close', () => {
      this.logger.info(`Client has disconnected: ${id}`)
    })

    this.logger.info(`New connection from: ${id}`)
  }
}

KiteServer.prototype.handleMessage = handleIncomingMessage

export default KiteServer
