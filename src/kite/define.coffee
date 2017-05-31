atob = require 'atob'
parse = require 'try-json-parse'

module.exports = Object.defineProperty or (ctx, name, { value }) ->
  # TODO: what should this error message be?
  throw new Error "Unsupported options!"  unless value?
  ctx[name] = value # just use assignment if defineProperty isn't there
