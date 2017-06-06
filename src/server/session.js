import Emitter from '../kite/emitter'

export default class Session extends Emitter {
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
    const { remoteAddress, remotePort } = this.connection._socket

    return `${remoteAddress}:${remotePort}`
  }

  send(message) {
    return this.connection.send(message)
  }

  close() {
    return this.connection.close()
  }
}
