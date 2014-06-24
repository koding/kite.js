atob = require 'atob'
parse = require 'try-json-parse'

exports.define = Object.defineProperty or (ctx, name, { value }) ->
  throw new Error "Unsupported options!"  unless value? # TODO: what should this error message be?
  ctx[name] = value # just use assignment if defineProperty isn't there

exports.now = ->
  now = new Date
  new Date(
    now.getUTCFullYear()
    now.getUTCMonth()
    now.getUTCDate()
    now.getUTCHours()
    now.getUTCMinutes()
    now.getUTCSeconds()
  )

exports.getKontrolClaims = (kiteKey) ->
  [ _, kontrolClaimsA ] = kiteKey.split '.'
  parse atob kontrolClaimsA