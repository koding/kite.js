const Emitter = require('../../kite/emitter')

export default class Session extends Emitter {
  constructor(connection) {
    super()

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
