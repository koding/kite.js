const Kite = require('./kite')
const Kontrol = require('./kontrol')

if (typeof window !== 'undefined' && window !== null) {
  window.Kite = window.Kite ? window.Kite : Kite
  window.Kontrol = window.Kontrol ? window.Kontrol : Kontrol
}
