const expect = require('expect')
const kite = require('../src')

describe('kite.js', () =>
  it('should provide Kontrol and Kite', () => {
    expect(kite.Kite).toExist()
    expect(kite.Kontrol).toExist()
  }))
