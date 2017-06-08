import expect from 'expect'
import Kite from './base'
import { Defaults, State } from '../constants'

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
