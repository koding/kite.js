import Kite from '../../kite'
import Server from './'

const logLevel = 0

describe('WebSocket Server', () => {
  it('should be able to accept kite connections', done => {
    const kite = new Kite({
      url: 'http://localhost:7777',
      autoReconnect: false,
      autoConnect: false,
      logLevel,
    })

    const server = new Server({ port: 7777, logLevel })
    server.on('connection', connection => {
      server.close()
      done()
    })

    kite.connect()
  })
})
