define = require './define'

module.exports = (method, ctx = this) ->
  throw new Error "Could not bind method: #{method}"  unless ctx[method]?
  boundMethod = "__bound__#{method}"
  boundMethod of ctx or define(
    ctx, boundMethod, value: ctx[method].bind ctx
  )
  return ctx[boundMethod]

