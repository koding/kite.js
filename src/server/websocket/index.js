const { Server: WebSocketServer } = require('ws')
const Emitter = require('../../kite/emitter')
const Session = require('./session')

class Server extends Emitter {
  constructor(options) {
    super()
    this.options = options
    this.server = new WebSocketServer({ port: options.port })
    this.server.on('connection', connection => {
      return this.emit('connection', new Session(connection))
    })
  }

  getAddress() {
    return `${this.server.options.host}:${this.server.options.port}`
  }

  close() {
    this.server && this.server.close()
  }
}

Server.scheme = 'ws'
Server.secureScheme = 'wws'

export default Server
