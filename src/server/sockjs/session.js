let Session
const util = require('util')

const EventEmitter = require('../../event-emitter.coffee')

module.exports = Session = class Session extends EventEmitter {
  constructor(connection) {
    if (!(this instanceof Session)) {
      return new Session(connection)
    }
    this.connection = connection

    this.connection.on('data', message => {
      return this.emit('message', message)
    })

    this.connection.on('close', () => {
      return this.emit('close')
    })
  }

  getId() {
    return `${this.connection.remoteAddress}:${this.connection.remotePort}`
  }

  send(message) {
    return this.connection.write(message)
  }

  close() {
    return this.connection.close()
  }
}
