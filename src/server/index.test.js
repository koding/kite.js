const expect = require('expect')
const Kite = require('../kite')
const KiteServer = require('./')
const SockJS = require('sockjs-client')
const SockJsServer = require('./sockjs')

const logLevel = 0

describe('KiteServer with SockJS', () => {
  it('should be able to accept kite connections', done => {
    const kite = new Kite({
      url: 'http://0.0.0.0:7780',
      autoReconnect: false,
      autoConnect: false,
      transportClass: SockJS,
      logLevel,
    })

    const math = new KiteServer({
      name: 'math',
      auth: false,
      serverClass: SockJsServer,
      logLevel,
      api: {
        square: function(x, callback) {
          callback(null, x * x)
        },
      },
    })

    kite.on('open', () => {
      kite.tell('square', 5).then(res => expect(res).toBe(25)).finally(() => {
        kite.disconnect()
        math.close()
        done()
      })
    })

    math.listen(7780)
    kite.connect()
  })
})

describe('KiteServer with WebSocket', () => {
  it('should be able to accept kite connections', done => {
    const kite = new Kite({
      url: 'http://0.0.0.0:7780',
      autoReconnect: false,
      autoConnect: false,
      logLevel,
    })

    const math = new KiteServer({
      name: 'math',
      auth: false,
      logLevel,
      api: {
        square: function(x, callback) {
          callback(null, x * x)
        },
      },
    })

    kite.on('open', () => {
      kite.tell('square', 5).then(res => expect(res).toBe(25)).finally(() => {
        kite.disconnect()
        math.close()
        done()
      })
    })

    math.listen(7780)
    kite.connect()
  })
})
