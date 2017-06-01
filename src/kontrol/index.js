let Kontrol
const BaseKontrol = require('./base')
const Kite = require('../kite')
const Promise = require('bluebird')

const methods = [
  'fetchKites',
  'fetchKite',
  'watchKites',
  'cancelWatcher',
  'register',
]

module.exports = Kontrol = (() => {
  Kontrol = class Kontrol extends BaseKontrol {
    static initClass() {
      this.Kite = Kite
      methods.forEach(
        method =>
          (Kontrol.prototype[method] = Promise.promisify(
            BaseKontrol.prototype[method]
          ))
      )
    }
  }
  Kontrol.initClass()
  return Kontrol
})()
