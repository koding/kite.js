const jwt = require('jwt-simple')
const atob = require('atob')
const parse = require('try-json-parse')
const getKontrolClaims = require('./claims')

module.exports = (tokenString, kiteKey) => {
  const [headersA] = tokenString.split('.')
  const kontrolClaims = getKontrolClaims(kiteKey)
  const headers = parse(atob(headersA))
  const claims = jwt.decode(tokenString, kontrolClaims.kontrolKey)
  return { headers, claims }
}
