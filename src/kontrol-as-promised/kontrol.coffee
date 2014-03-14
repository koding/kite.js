BasicKontrol = require '../kontrol/kontrol.coffee'

module.exports = class Kontrol extends BasicKontrol

  @Kite = require '../kite-as-promised/kite.coffee'

  Promise = require 'bluebird'

  constructor: (options) ->
    return new Kontrol options  unless this instanceof Kontrol
    super options

  fetchKites: (selector = {}, callback) ->
    new Promise (resolve, reject) =>
      super selector, (err, kites) ->
        return reject err  if err?
        return resolve kites
      return
    .nodeify callback

  fetchKite: (selector = {}, callback) ->
    @fetchKites selector
    .then ([kite]) -> kite
    .nodeify callback

  cancelWatcher: (id, callback) ->
    new Promise (resolve, reject) =>
      super id, (err) ->
        return reject err  if err
        return resolve null
      return
    .nodeify callback
