const SockJS = require('sockjs')
const http = require('http')

const Emitter = require('../../kite/emitter')
const Session = require('./session')

class Server extends Emitter {
  constructor(options) {
    super()

    this.sockjs = SockJS.createServer()
    this.server = http.createServer()
    this.options = options ? options : {}
    this.options.hostname = this.options.hostname || '0.0.0.0'
    if (!this.options.port) throw new Error('port is required!')


    this.sockjs.on('connection', connection => {
      return this.emit('connection', new Session(connection))
    })

    this.sockjs.installHandlers(this.server, { prefix: options.prefix || '' })

    this.server.listen(options.port, options.hostname)
  }

  getAddress() {
    return `${this.options.hostname}:${this.options.port}`
  }

  close() {
    if (this.server != null) {
      return this.server.close()
    }
  }
}

Server.scheme = 'http'
Server.secureScheme = 'https'

export default Server
