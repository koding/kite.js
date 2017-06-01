const kite = require('./index');

(() => {
  if (typeof window !== 'undefined' && window !== null) {
    window.Kite != null ? window.Kite : (window.Kite = kite.Kite)
  }
  return typeof window !== 'undefined' && window !== null ? (window.Kontrol != null ? window.Kontrol : (window.Kontrol = kite.Kontrol)) : undefined
})()
