atob = require 'atob'
parse = require 'try-json-parse'

module.exports = Object.defineProperty or (ctx, name, { value }) ->
  throw new Error "Unsupported options!"  unless value? # TODO: what should this error message be?
  ctx[name] = value # just use assignment if defineProperty isn't there

