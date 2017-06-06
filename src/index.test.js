import * as expect from 'expect'
import kite from '../src'

describe('kite.js', () =>
  it('should provide Kontrol and Kite', () => {
    expect(kite.Kite).toExist()
    expect(kite.Kontrol).toExist()
  }))
