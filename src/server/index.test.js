import expect from 'expect'
import Kite from '../kite'
import KiteServer from './'
import KiteApi from '../kiteapi'
import SockJS from 'sockjs-client'
import WebSocket from 'ws'

const logLevel = 0

describe('KiteServer', () => {
  it('should expose SockJS and WebSocket as transport class', done => {
    expect(KiteServer.transport.SockJS).toExist()
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
      transportClass: Kite.transport.SockJS,
      logLevel,
    })

    const math = new KiteServer({
      name: 'math',
      auth: false,
      serverClass: KiteServer.transport.SockJS,
      logLevel,
      api: {
        square: function(x, callback) {
          callback(null, x * x)
        },
      },
    })

    kite.on('open', () => {
      kite
        .tell('square', 5)
        .then(res => expect(res).toBe(25))
        .finally(() => {
          kite.disconnect()
          math.close()
          done()
        })
    })

    math.listen(7780)
    kite.connect()
  })

  it('should allow defining api after init', done => {
    const kite = new Kite({
      url: 'http://0.0.0.0:7780',
      autoReconnect: true,
      autoConnect: false,
      transportClass: Kite.transport.SockJS,
      logLevel,
    })

    const math = new KiteServer({
      name: 'math',
      serverClass: KiteServer.transport.SockJS,
      logLevel,
    })

    let squareApi = new KiteApi({
      auth: false,
      methods: {
        square: function(x, callback) {
          callback(null, x * x)
        },
      },
    })

    let cubeApi = new KiteApi({
      auth: false,
      methods: {
        cube: function(x, callback) {
          callback(null, x * x * x)
        },
      },
    })

    math.setApi(squareApi)

    kite
      .tell('square', 5)
      .then(res => expect(res).toBe(25))
      .finally(() => {
        math.setApi(cubeApi)

        kite.disconnect(true)
        kite.on('open', () => {
          kite
            .tell('cube', 5)
            .then(res => expect(res).toBe(125))
            .finally(() => {
              math.close()
              done()
            })
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
      kite
        .tell('square', 5)
        .then(res => expect(res).toBe(25))
        .finally(() => {
          kite.disconnect()
          math.close()
          done()
        })
    })

    math.listen(7780)
    kite.connect()
  })
})

describe('KiteServer connection', () => {
  describe('with existing connection', () => {
    it('should throw if the given connection is closed', done => {
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

      math.listen(7780)

      const connection = new WebSocket('ws://localhost:7780')

      connection.on('open', () => {
        connection.on('close', () => {
          math.close()
          expect(() => {
            return new Kite({ connection: connection, logLevel })
          }).toThrow(/Given connection is closed/)
          done()
        })
        connection.close()
      })
    })

    it('should work with a WebSocket connection', done => {
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

      math.listen(7780)

      const connection = new WebSocket('ws://localhost:7780')

      const kite = new Kite({
        connection,
        logLevel,
      })

      kite.on('open', () => {
        kite
          .tell('square', 5)
          .then(res => expect(res).toBe(25))
          .finally(() => {
            kite.disconnect()
            math.close()
            done()
          })
      })
    })

    it('should work with a SockJS connection', done => {
      const math = new KiteServer({
        name: 'math',
        auth: false,
        serverClass: KiteServer.transport.SockJS,
        logLevel,
        api: {
          square: function(x, callback) {
            callback(null, x * x)
          },
        },
      })

      math.listen(7780)

      const connection = new SockJS('http://0.0.0.0:7780')

      const kite = new Kite({
        connection,
        logLevel,
      })

      kite.on('open', () => {
        kite
          .tell('square', 5)
          .then(res => expect(res).toBe(25))
          .finally(() => {
            kite.disconnect()
            math.close()
            done()
          })
      })
    })
  })
})

describe('KiteServer to Remote Kite connection', () => {
  it('should work with WebSocket transport', done => {
    const kite = new Kite({
      url: 'ws://0.0.0.0:7780',
      autoReconnect: false,
      autoConnect: false,
      logLevel,
      api: {
        square: function(x, callback) {
          callback(null, x * x)
        },
      },
    })

    const math = new KiteServer({
      name: 'math',
      auth: false,
      logLevel,
    })

    math.listen(7780)
    math.server.on('connection', connection => {
      connection.kite
        .tell('square', 5)
        .then(res => expect(res).toBe(25))
        .finally(() => {
          kite.disconnect()
          math.close()
          done()
        })
    })

    kite.connect()
  })

  it('should work with SockJS transport', done => {
    const kite = new Kite({
      url: 'http://0.0.0.0:7780',
      transportClass: Kite.transport.SockJS,
      autoReconnect: false,
      autoConnect: false,
      logLevel,
      api: {
        square: function(x, callback) {
          callback(null, x * x)
        },
      },
    })

    const math = new KiteServer({
      serverClass: KiteServer.transport.SockJS,
      name: 'math',
      auth: false,
      logLevel,
    })

    math.listen(7780)
    math.server.on('connection', connection => {
      connection.kite
        .tell('square', 5)
        .then(res => expect(res).toBe(25))
        .finally(() => {
          kite.disconnect()
          math.close()
          done()
        })
    })

    kite.connect()
  })
})
