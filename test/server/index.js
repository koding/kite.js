let Server
const { Server: WebSocketServer } = require('ws')

const Emitter = require('../../src/kite/emitter')
const Session = require('./session')

module.exports = Server = (() => {
  Server = class Server extends Emitter {
    static initClass () {
      this.scheme = 'ws'
      this.secureScheme = 'wss'
    }

    constructor (options) {
      super()

      this.options = options
      this.server = new WebSocketServer({ port: options.port })

      this.server.on('connection', connection => {
        return this.emit('connection', new Session(connection))
      })
    }

    getAddress () {
      return `${this.server.options.host}:${this.server.options.port}`
    }

    close () {
      return this.server != null ? this.server.close() : undefined
    }
  }
  Server.initClass()
  return Server
})()
