const expect = require('expect')
const Kite = require('./base')
const { Defaults: { KiteInfo } } = require('../constants')

describe('Kite', () => {
  describe('::getKiteInfo', () =>
    it('should return default kite info if no option provided', () => {
      let kite = new Kite({
        url: 'ws://localhost',
        autoConnect: false,
      })
      expect(kite).toExist()

      let kiteInfo = kite.getKiteInfo()
      delete kiteInfo.id // new id generated each time
      expect(kiteInfo).toEqual(KiteInfo)
    }))
})
