import Kite from '../../kite'
import Server from './'
const logLevel = 0

describe('SockJS Server with WebSocket', () => {
  it('should be able to accept kite connections', done => {
    const kite = new Kite({
      url: 'http://localhost:7778',
      autoReconnect: false,
      autoConnect: false,
      transportClass: Kite.transport.SockJS,
      logLevel,
    })

    const server = new Server({ port: 7778, logLevel })
    server.on('connection', connection => {
      server.close()
      done()
    })

    kite.connect()
  })
})

describe('SockJS Server with XHR', () => {
  it('should be able to accept kite connections', done => {
    const kite = new Kite({
      url: 'http://localhost:7779',
      autoReconnect: false,
      autoConnect: false,
      transportClass: Kite.transport.SockJS,
      transportOptions: {
        transports: ['xhr-polling'],
      },
      logLevel,
    })

    const server = new Server({ port: 7779, logLevel })
    server.on('connection', connection => {
      server.close()
      done()
    })

    kite.connect()
  })
})
