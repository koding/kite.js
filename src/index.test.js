import expect from 'expect'
import kite from '../src'

describe('kite.js', () =>
  it('should provide Kontrol, Kite and KiteServer', () => {
    expect(kite.Kite).toExist()
    expect(kite.KiteApi).toExist()
    expect(kite.Kontrol).toExist()
    expect(kite.KiteServer).toExist()
  }))
