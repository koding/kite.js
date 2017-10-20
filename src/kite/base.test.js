import expect from 'expect'
import BaseKite from './base'
import Kite from '.'
import KiteApi from '../kiteapi'
import KiteServer from '../server'
import { Defaults, State, AuthType } from '../constants'

const logLevel = 0

const makeKite = (options = {}) => {
  options = Object.assign(
    {},
    {
      url: 'ws://localhost',
      autoConnect: false,
      autoReconnect: false,
      logLevel: 0,
    },
    options
  )

  return new BaseKite(options)
}

describe('BaseKite', () => {
  it('should expose DebugLevels', () => {
    expect(BaseKite.DebugLevel).toExist()
  })

  it('should expose SockJS and WebSocket as transport class', () => {
    expect(BaseKite.transport.SockJS).toExist()
    expect(BaseKite.transport.WebSocket).toExist()
  })

  describe('constructor', () => {
    it('requires a valid url', () => {
      expect(() => new BaseKite({})).toThrow(/"url" must be a string/)
      expect(() => new BaseKite({ url: 'foo' })).toThrow(/invalid url/)
      expect(
        () => new BaseKite({ autoConnect: false, url: 'http://localhost' })
      ).toNotThrow()
    })

    it('accepts a prefix', () => {
      const kite = makeKite({ prefix: '/foo' })
      expect(kite.options.url).toBe('ws://localhost/foo')
    })

    it('starts with NOTREADY readyState', () => {
      const kite = makeKite()
      expect(kite.readyState).toBe(State.NOTREADY)
    })
  })

  describe('getToken', () => {
    it('returns auth token', () => {
      const kite = makeKite({
        auth: {
          key: 'foo',
        },
      })

      expect(kite.getToken()).toBe('foo')
    })
  })

  describe('setToken', () => {
    it('fails if kite is initialized with default auth type token', () => {
      const kite = makeKite({
        auth: AuthType.token /* === 'token' */,
      })

      expect(() => kite.setToken('foo')).toThrow(/Invalid auth type/)
    })

    it('fails if kite is initialized without any auth options', () => {
      const kite = makeKite()

      expect(() => kite.setToken('foo')).toThrow(/Auth option must be set/)
    })

    it('works well if kite is initialized with correct auth options', () => {
      const kite = makeKite({
        auth: {
          key: 'foo',
        },
      })

      kite.setToken('bar')

      expect(kite.getToken()).toBe('bar')
    })
  })

  describe('getKiteInfo', () =>
    it('should return default kite info if no option provided', () => {
      let kite = new BaseKite({
        url: 'ws://localhost',
        autoConnect: false,
      })
      expect(kite).toExist()

      let kiteInfo = kite.getKiteInfo()
      delete kiteInfo.id // new id generated each time
      expect(kiteInfo).toEqual(Defaults.KiteInfo)
    }))

  describe('setApi', () => {
    it('should allow defining api after init', done => {
      let kite = new BaseKite({
        url: 'ws://localhost',
        autoConnect: false,
      })
      expect(kite).toExist()
      expect(kite.api.methods.foo).toNotExist()
      expect(kite.api.methods['kite.ping']).toExist()

      kite.setApi(
        new KiteApi({
          auth: false,
          methods: {
            foo: function(bar, callback) {
              callback(null, bar)
            },
          },
        })
      )

      expect(kite.api.methods.foo).toExist()
      expect(kite.api.methods['kite.ping']).toExist()

      done()
    })

    it('should work with the new api', done => {
      const kiteServer = new KiteServer({
        name: 'kite-server',
        auth: false,
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

      const kite = new Kite({
        url: 'http://0.0.0.0:7780',
        autoConnect: false,
        logLevel,
      })

      expect(kite).toExist()

      expect(kite.api.methods.square).toNotExist()
      expect(kite.api.methods.cube).toNotExist()

      kite.setApi(squareApi)

      expect(kite.api.methods.square).toExist()
      expect(kite.api.methods.cube).toNotExist()

      kiteServer.listen(7780)

      kiteServer.server.once('connection', connection => {
        connection.kite
          .tell('square', 5)
          .then(res => expect(res).toBe(25))
          .finally(() => {
            kite.setApi(cubeApi)
            expect(kite.api.methods.square).toNotExist()
            expect(kite.api.methods.cube).toExist()

            connection.kite
              .tell('cube', 5)
              .then(res => expect(res).toBe(125))
              .finally(() => {
                kite.disconnect()
                kiteServer.close()
                done()
              })
          })
      })

      kite.connect()
    })
  })
})
