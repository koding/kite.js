import { Server as WebSocketServer } from 'ws'
import Emitter from '../kite/emitter'
import Session from './session'

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
