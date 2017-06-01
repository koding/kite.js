const kite = require('./index')

if (typeof window !== 'undefined' && window !== null) {
  window.Kite = window.Kite ? window.Kite : kite.Kite
  window.Kontrol = window.Kontrol ? window.Kontrol : kite.Kontrol
}
