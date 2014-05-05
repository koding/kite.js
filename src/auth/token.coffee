jwt = require 'jwt-simple'
atob = require 'atob'

parse = (it) -> try JSON.parse atob it

module.exports = (tokenString, kiteKey) ->
  [ _, kontrolClaimsA ] = kiteKey.split '.'
  [ headersA, publicClaimsA ] = tokenString.split '.'

  kontrolClaims = parse kontrolClaimsA
  headers = parse headersA

  claims = jwt.decode tokenString, kontrolClaims.kontrolKey

  { headers, claims }
