let Kontrol
const BaseKontrol = require('./base')
const Kite = require('../kite')
const Promise = require('bluebird')

module.exports = Kontrol = (() => {
  Kontrol = class Kontrol extends BaseKontrol {
    static initClass () {
      this.Kite = Kite;

      ['fetchKites', 'fetchKite', 'watchKites', 'cancelWatcher', 'register'].forEach(method => (Kontrol.prototype[method] = Promise.promisify(BaseKontrol.prototype[method])))
    }

    constructor (options) {
      if (!(this instanceof Kontrol)) {
        return new Kontrol(options)
      }
      super(options)
    }
  }
  Kontrol.initClass()
  return Kontrol
})()