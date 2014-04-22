"use strict"

assign = require 'lodash.assign'

module.exports = (api) ->
  assign

    'kite.ping': (callback) ->
      callback null, 'pong'

    'kite.log': (message, callback) ->
      console.log message
      callback null

  , api
