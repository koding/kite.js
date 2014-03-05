"use strict"

module.exports = (userlandApi = {}) ->
  api = ['error', 'info', 'log', 'warn'].reduce (api, method) ->
    api[method] = console[method].bind console
    api
  , {}
  api[method] = fn  for own method, fn of userlandApi
  api
