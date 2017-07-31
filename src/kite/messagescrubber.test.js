import expect from 'expect'
import Kite from './'
import KiteError from './error'
import { Defaults } from '../constants'

import MessageScrubber from './messagescrubber'

describe('kite/messagescrubber', () => {
  it('expects a kite to be passed', () => {
    expect(() => new MessageScrubber()).toThrow(/invalid kite: undefined/)
    expect(
      () => new MessageScrubber({ kite: new Kite({ autoConnect: false }) })
    ).toNotThrow()
  })

  describe('wrapMessage', () => {
    it('wraps params', () => {
      const kite = new Kite({ autoConnect: false })
      let called = false

      let callback = () => (called = true)

      const scrubber = new MessageScrubber({ kite })
      const params = [1, 2, 3, 4]

      const result = scrubber.wrapMessage(params, callback)

      // ...params, callback, kiteInfo
      expect(result.length).toBe(6)

      expect(result[0]).toEqual(1)
      expect(result[1]).toEqual(2)
      expect(result[2]).toEqual(3)
      expect(result[3]).toEqual(4)

      expect(result[5].kite).toInclude(Defaults.KiteInfo)

      // test the returned responseCallback works correctly
      expect(called).toBe(false)
      result[4]({})
      expect(called).toBe(true)

      expect.spyOn(KiteError, 'makeProperError')

      const err = { message: 'raw error' }

      result[4](err)
      expect(KiteError.makeProperError).toHaveBeenCalledWith(err)
    })

    it('wraps kite auth option as authentication param', () => {
      const kite = new Kite({ autoConnect: false, auth: { foo: 'bar' } })
      const scrubber = new MessageScrubber({ kite })

      const result = scrubber.wrapMessage([1, 2, 3], () => {})

      expect(result[4].authentication).toEqual({ foo: 'bar' })
    })
  })

  describe('scrub', () => {
    it('scrubs parameters to make it ready for rpc call', () => {
      const kite = new Kite({ autoConnect: false })
      const scrubber = new MessageScrubber({ kite })

      const result = scrubber.scrub('ping', [1, 2], () => {})

      expect(result.method).toBe('ping')
      expect(result.callbacks).toExist()
    })
  })
})
