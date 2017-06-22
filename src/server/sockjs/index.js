import SockJS from 'sockjs'
import http from 'http'
import Logger from '../../kite/Logger'
import Emitter from '../../kite/emitter'
import Session from './session'

class Server extends Emitter {
  constructor(options = {}) {
    super()
    this.options.hostname = this.options.hostname || '0.0.0.0'
    if (!this.options.port) throw new Error('port is required!')

    this.logger = new Logger({
      name: options.name,
      level: options.logLevel,
    })

    const sockjsOptions = {
      log: (level, message) => {
        const fn = this.logger[level]
        if (fn) {
          fn(message)
        }
      },
    }

    this.sockjs = SockJS.createServer(sockjsOptions)
    this.server = http.createServer()

    this.sockjs.on('connection', connection => {
      this.logger.debug('a new connection', connection)
      this.emit('connection', new Session(connection))
    })

    this.sockjs.installHandlers(this.server, { prefix: options.prefix || '' })

    this.logger.debug('starting to listen on server', options)
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
