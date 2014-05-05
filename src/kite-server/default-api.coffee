"use strict"

module.exports = ->
  'kite.ping': (callback) ->
    callback null, 'pong'

  'kite.log': (message, callback) ->
    console.log message
    callback null

  'kite.echo': (err, callback) ->
    callback err
