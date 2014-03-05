"use strict"

module.exports = (method, ctx = this) ->
  throw new Error "Could not bind method: #{method}"  unless ctx[method]?
  boundMethod = "__bound__#{method}"
  boundMethod of ctx or Object.defineProperty(
    ctx, boundMethod, value: ctx[method].bind this
  )
  return ctx[boundMethod]
