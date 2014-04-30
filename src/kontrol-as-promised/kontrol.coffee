"use strict"

BasicKontrol = require '../kontrol/kontrol.coffee'

module.exports = class Kontrol extends BasicKontrol

  @Kite = require '../kite-as-promised/kite.coffee'

  Promise = require 'bluebird'

  constructor: (options) ->
    return new Kontrol options  unless this instanceof Kontrol
    super options

  [
    'fetchKites'
    'fetchKite'
    'watchKites'
    'cancelWatcher'
    'register'
  ].forEach (method) ->
    Kontrol::[method] = Promise.promisify BasicKontrol::[method]
