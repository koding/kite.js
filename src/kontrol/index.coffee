BaseKontrol = require './base'
Kite = require '../kite'
Promise = require 'bluebird'

module.exports = class Kontrol extends BaseKontrol

  @Kite = Kite

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
    Kontrol::[method] = Promise.promisify BaseKontrol::[method]

