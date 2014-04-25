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
  # [ regSeg, pubSeg, privSeg ] = token.split '.'

  # console.log { regSeg, pubSeg, privSeg }

  # reg = try JSON.parse atob regSeg
  # pub = try JSON.parse atob pubSeg

  # console.log { reg, pub }

  # Promise.resolve()