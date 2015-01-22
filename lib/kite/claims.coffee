atob = require 'atob'
parse = require 'try-json-parse'

module.exports = (kiteKey) ->
  [ _, kontrolClaimsA ] = kiteKey.split '.'
  parse atob kontrolClaimsA

