import expect from 'expect'
import Kite from '../kite'
import KiteServer from './'
import SockJS from 'sockjs-client'
import SockJsServer from './sockjs'
import { Event, State } from '../constants'

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
      url: 'ws://0.0.0.0:7780',
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

describe('kite operations', () => {
  // since we need a server to be able to test connection related methods of
  // kite we need to do these here.
  // TODO: export these tests into a more appropriate place.
  //
  describe('kite.disconnect()', () => {
    it('should set readyState to closed', done => {
      withServer((kite, server) => {
        kite.ws.addEventListener(Event.close, () => {
          process.nextTick(() => {
            expect(kite.readyState).toBe(State.CLOSED)
            server.close()
            done()
          })
        })

        kite.disconnect()
      })
    })

    it('should try to reconnect when reconnect arg is true', done => {
      const kite = new Kite({
        url: 'ws://0.0.0.0:7780',
        autoReconnect: true, // make sure autoReconnect is true
        autoConnect: false,
        logLevel,
      })

      withServer({ kite }, (kite, server) => {
        kite.once('open', () => {
          // if autoReconnect is working, this callbacck should be called again.
          kite.disconnect()
          server.close()
          done()
        })

        // tell disconnect to retry again by passing `true` as arg.
        kite.disconnect(true)
      })
    })
  })
})

const withServer = (options, callback) => {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  const kite =
    options.kite ||
    new Kite({
      url: 'ws://0.0.0.0:7780',
      autoReconnect: false,
      autoConnect: false,
      logLevel,
    })

  const server =
    options.server ||
    new KiteServer({
      name: 'server',
      auth: false,
      logLevel,
    })

  kite.once('open', () => {
    callback(kite, server)
  })

  server.listen(7780)
  kite.connect()
}
