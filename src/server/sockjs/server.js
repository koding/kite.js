let Server
const util = require('util')
const sockJS = require('sockjs')
const http = require('http')

const EventEmitter = require('../../event-emitter.coffee')
const Session = require('./session.js')

module.exports = Server = (() => {
  Server = class Server extends EventEmitter {
    static initClass() {
      this.scheme = 'http'
      this.secureScheme = 'https'
    }

    constructor(options) {
      if (!(this instanceof Server)) {
        return new Server(options)
      }
      this.sockjs = sockJS.createServer()
      this.server = http.createServer()
      this.options = options

      this.sockjs.on('connection', connection => {
        return this.emit('connection', new Session(connection))
      })

      this.sockjs.installHandlers(this.server, { prefix: options.prefix || '' })

      // WebSocketServer connects automatically:
      this.server.listen(options.port, options.hostname)
    }

    getAddress() {
      return this.server._connectionKey
    }

    close() {
      if (this.server != null) {
        return this.server.close()
      }
    }
  }
  Server.initClass()
  return Server
})()
