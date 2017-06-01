const expect = require('expect')
const kite = require('../src')

describe('kite', () =>
  it('should provide Kontrol and Kite', () => {
    expect(kite.Kite).toExist()
    return expect(kite.Kontrol).toExist()
  }))
