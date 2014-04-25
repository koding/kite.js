"use strict"

assign = require 'lodash.assign'

module.exports = (api) ->
  assign

    'kite.heartbeat': (callback) ->
      console.log 'kite heartbeat is called'
      callback null, null

    'kite.ping': (callback) ->
      callback null, 'pong'

    'kite.log': (message, callback) ->
      console.log message
      callback null

  , api
