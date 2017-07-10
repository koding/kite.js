import SockJS from 'sockjs'
import http from 'http'
import Emitter from '../../kite/emitter'
import Session from './session'

import KiteLogger from '../../KiteLogger'

export default class Server extends Emitter {
  static scheme = 'http'
  static secureScheme = 'https'

  constructor(options = {}) {
    super()

    this.options = options
    this.options.hostname = this.options.hostname || '0.0.0.0'
    if (!this.options.port) throw new Error('port is required!')

    this.logger = new KiteLogger({
      name: options.name,
      level: options.logLevel,
    })

    const sockjsOptions = {
      log: (level, message) => {
        if (this.logger[level]) {
          this.logger[level](message)
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
