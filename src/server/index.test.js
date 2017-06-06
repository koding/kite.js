import * as expect from 'expect'
import Kite from '../kite'
import Server from './'

describe('Server', () => {
  it('should be able to accept kite connections', done => {
    const kite = new Kite({
      url: 'http://localhost:7777',
      autoReconnect: false,
      autoConnect: false,
    })

    const server = new Server({ port: 7777 })
    server.on('connection', connection => {
      server.close()
      done()
    })

    kite.connect()
  })
})
