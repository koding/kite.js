"use strict"

BasicKite = require '../kite/kite.coffee'

module.exports = class Kite extends BasicKite

  Promise = require 'bluebird'

  constructor: (options) ->
    return new Kite options  unless this instanceof Kite
    super options

  [
    'tell'
    'ready'
  ].forEach (method) ->
    Kite::[method] = Promise.promisify BasicKite::[method]
