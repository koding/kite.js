expect = require 'expect'
kite = require '../src'


describe 'kite', ->

  it 'should provide Kontrol and Kite', ->
    expect(kite.Kite).toExist()
    expect(kite.Kontrol).toExist()
