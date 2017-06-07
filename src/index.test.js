const expect = require('expect')
const kite = require('../src')

describe('kite.js', () =>
  it('should provide Kontrol, Kite and KiteServer', () => {
    expect(kite.Kite).toExist()
    expect(kite.Kontrol).toExist()
    expect(kite.KiteServer).toExist()
  }))
