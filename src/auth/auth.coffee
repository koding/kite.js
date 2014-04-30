Promise = require 'bluebird'
atob = require 'atob'

handleToken = require './token.coffee'
whitelist = require './whitelist.coffee'

module.exports = Promise.method (method, auth, kiteKey) ->
  unless auth?
    return  if method in whitelist
    throw new Error "Access denied!"

  { type, key } = auth

  switch type
    when 'token'
      handleToken key, kiteKey
    else throw new Error "Unknown auth type: #{ type }"
