Interval = require './interval'

module.exports = (userlandApi = {}) ->

  api = ['error', 'info', 'log', 'warn'].reduce (api, method) ->
    api[method] = console[method].bind console
    api
  , {}
  api['kite.heartbeat'] = (duration, ping, callback) =>
    @heartbeatHandle = new Interval ping, duration * 1000
    callback { error: null }
  api[method] = fn  for own method, fn of userlandApi
  api

