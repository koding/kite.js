Promise = require 'bluebird'

handleToken = require './token.coffee'

atob = require 'atob'

module.exports = Promise.method (auth, kiteKey) ->
  # FIXME: this is insecure by default.
  return Promise.resolve()  unless auth?
  # should be:
  # return Promise.reject new Error "Access denied!"  unless auth?

  { type, key } = auth

  switch type
    when 'token'
      handleToken key, kiteKey
    else throw new Error "Unknown auth type: #{ type }"
