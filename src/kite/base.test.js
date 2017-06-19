import expect from 'expect'
import Kite from './base'
import { Defaults, State, AuthType } from '../constants'

const makeKite = (options = {}) => {
  options = Object.assign(
    {},
    {
      url: 'ws://localhost',
      autoConnect: false,
      autoReconnect: false,
    },
    options
  )

  return new Kite(options)
}

describe('Kite', () => {
  describe('constructor', () => {
    it('requires a valid url', () => {
      expect(() => new Kite({})).toThrow(/"url" must be a string/)
      expect(() => new Kite({ url: 'foo' })).toThrow(/invalid url/)
      expect(() => new Kite({ url: 'http://localhost' })).toNotThrow()
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
      let kite = new Kite({
        url: 'ws://localhost',
        autoConnect: false,
      })
      expect(kite).toExist()

      let kiteInfo = kite.getKiteInfo()
      delete kiteInfo.id // new id generated each time
      expect(kiteInfo).toEqual(Defaults.KiteInfo)
    }))
})
