import expect from 'expect'
import Kite from '../kite'
import KiteServer from './'
import SockJS from 'sockjs-client'

const logLevel = 0

describe('KiteServer', () => {
  it('should expose SockJs and WebSocket as transport class', done => {
    expect(KiteServer.transport.SockJs).toExist()
    expect(KiteServer.transport.WebSocket).toExist()
    done()
  })
})

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
      serverClass: KiteServer.transport.SockJs,
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
      serverClass: KiteServer.transport.WebSocket,
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
