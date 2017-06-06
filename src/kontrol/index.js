let Kontrol
import BaseKontrol from './base'
import Kite from '../kite'
import * as Promise from 'bluebird'

const methods = [
  'fetchKites',
  'fetchKite',
  'watchKites',
  'cancelWatcher',
  'register',
]

export default (Kontrol = (() => {
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
})())
