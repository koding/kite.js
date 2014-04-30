Promise = require 'bluebird'
atob = require 'atob'

handleToken = require './token.coffee'
whitelist = require './whitelist.coffee'

module.exports = Promise.method (method, auth, kiteKey) ->
  unless auth?
    return Promise.resolve()  if method in whitelist
    return Promise.reject new Error "Access denied!"

  { type, key } = auth

  switch type
    when 'token'
      handleToken key, kiteKey
    else throw new Error "Unknown auth type: #{ type }"
