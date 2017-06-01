const expect = require('expect')
const kite = require('../src')

describe('kite', () =>
  it('should provide Kontrol and Kite', () => {
    expect(kite.Kite).toExist()
    expect(kite.Kontrol).toExist()
  }))

describe('connection', () =>
  it('should be able to connect over ws', done => {
    const Server = require('./server')
    let kiteInstance
    let server

    server = new Server({ port: 7777 })
    server.on('connection', connection => {
      server.close()
      done()
    })

    kiteInstance = new kite.Kite({
      url          : 'http://localhost:7777',
      autoReconnect: false,
    })

    expect(kiteInstance).toExist()
  }))
