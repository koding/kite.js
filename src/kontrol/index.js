import BaseKontrol from './base'
import Promise from 'bluebird'
import Kite from '../kite'

const methods = [
  'fetchKites',
  'fetchKite',
  'watchKites',
  'cancelWatcher',
  'register',
]

class Kontrol extends BaseKontrol {}

Kontrol.prototype.Kite = Kite

for (var method of methods) {
  Kontrol.prototype[method] = Promise.promisify(BaseKontrol.prototype[method])
}

export default Kontrol
