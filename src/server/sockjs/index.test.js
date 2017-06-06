const Kite = require('../../kite')
const Server = require('./')
const SockJS = require('sockjs-client')

describe('SockJS Server with WebSocket', () => {
  it('should be able to accept kite connections', done => {
    const kite = new Kite({
      url: 'http://localhost:7778',
      autoReconnect: false,
      autoConnect: false,
      transportClass: SockJS,
    })

    const server = new Server({ port: 7778 })
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
      transportClass: SockJS,
      transportOptions: {
        transports: ['xhr-polling'],
      },
    })

    const server = new Server({ port: 7779 })
    server.on('connection', connection => {
      server.close()
      done()
    })

    kite.connect()
  })
})
