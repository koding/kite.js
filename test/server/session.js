const Emitter = require('../../src/kite/emitter')

module.exports = class Session extends Emitter {
  constructor(connection) {
    super()

    this.connection = connection

    this.connection.on('message', message => {
      console.log('message', message)
      return this.emit('message', message)
    })

    this.connection.on('close', () => {
      return this.emit('close')
    })
  }

  getId() {
    return `${this.connection._socket.remoteAddress}:${this.connection._socket.remotePort}`
  }

  send(message) {
    return this.connection.send(message)
  }

  close() {
    return this.connection.close()
  }
}
