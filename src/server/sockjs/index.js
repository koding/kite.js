const SockJS = require('sockjs')
const http = require('http')

const enableLogging = require('../../kite/enableLogging')
const Emitter = require('../../kite/emitter')
const Session = require('./session')

class Server extends Emitter {
  constructor(options) {
    super()

    this.options = options ? options : {}
    this.options.hostname = this.options.hostname || '0.0.0.0'
    if (!this.options.port) throw new Error('port is required!')

    enableLogging(options.name, this, options.logLevel)

    const sockjsOptions = {
      log: (level, message) => {
        this.emit(level, message)
      },
    }

    this.sockjs = SockJS.createServer(sockjsOptions)
    this.server = http.createServer()

    this.sockjs.on('connection', connection => {
      this.emit('debug', 'a new connection', connection)
      this.emit('connection', new Session(connection))
    })

    this.sockjs.installHandlers(this.server, { prefix: options.prefix || '' })

    this.emit('debug', 'starting to listen on server', options)
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
