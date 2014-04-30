Promise = require 'bluebird'
jwt = require 'jwt-simple'
atob = require 'atob'

parse = (it) -> try JSON.parse atob it

module.exports = (tokenString, kiteKey) ->
  [ _, kontrolClaimsA ] = kiteKey.split '.'
  [ headersA, publicClaimsA ] = tokenString.split '.'

  claims = parse kontrolClaimsA
  headers = parse headersA
  publicClaims = parse publicClaimsA

  privateClaims = jwt.decode tokenString, claims.kontrolKey

  Promise.resolve { headers, publicClaims, privateClaims }
