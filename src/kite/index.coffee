BaseKite = require './base'
Promise = require 'bluebird'

module.exports = class Kite extends BaseKite
  constructor: (options) ->
    return new Kite options  unless this instanceof Kite
    super options

  tell: (method, params, callback) ->
    new Promise (resolve, reject) =>
      super method, params, (err, result) ->
        return reject err  if err
        return resolve result
    .nodeify callback

  ready: (callback) ->
    new Promise (resolve) =>
      super resolve
    .nodeify callback

  expireToken: Promise.promisify @::expireToken

