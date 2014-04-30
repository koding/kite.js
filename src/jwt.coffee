jwt = require 'jwt-simple'
atob = require 'atob'

module.exports =

  decode: (token, keyFn, noVerify) ->
    key = switch typeof keyFn
      when 'string'
        keyFn
      when 'function'
        [ _, claimsA ] = token.split '.'
        claims = try JSON.parse atob claimsA
        console.log claims
        keyFn.call this, claims
      else throw new Error "key must be either a string or a function"
    console.log key
    jwt.decode token, key, noVerify

  encode: (payload, key, algorithm) ->
    jwt.encode payload, key, algorithm
