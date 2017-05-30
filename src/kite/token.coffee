jwt = require 'jwt-simple'
atob = require 'atob'
parse = require 'try-json-parse'
getKontrolClaims = require './claims'

module.exports = (tokenString, kiteKey) ->
  [ headersA, publicClaimsA ] = tokenString.split '.'
  kontrolClaims = getKontrolClaims kiteKey
  headers = parse atob headersA
  claims = jwt.decode tokenString, kontrolClaims.kontrolKey
  { headers, claims }

