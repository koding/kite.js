BasicKite = require '../kite/kite.coffee'

module.exports = class Kite extends BasicKite

  Promise = require 'bluebird'

  tell: (method, params, callback) ->
    new Promise (resolve, reject) =>
      super method, params, (err, result) =>
        return reject err  if err?
        return resolve result
      return
    .timeout @options.timeout ? 5000
    .nodeify callback

      
