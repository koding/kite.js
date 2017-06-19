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

      expect(result.kite).toInclude(Defaults.KiteInfo)
      expect(result.withArgs).toEqual(params)

      // test the returned responseCallback works correctly
      expect(called).toBe(false)
      result.responseCallback({})
      expect(called).toBe(true)

      expect.spyOn(KiteError, 'makeProperError')
      result.responseCallback({ error: 'raw error' })
      expect(KiteError.makeProperError).toHaveBeenCalledWith('raw error')
    })

    it('wraps kite auth option as authentication param', () => {
      const kite = new Kite({ autoConnect: false, auth: { foo: 'bar' } })
      const scrubber = new MessageScrubber({ kite })

      const result = scrubber.wrapMessage([1, 2, 3], () => {})

      expect(result.authentication).toEqual({ foo: 'bar' })
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
