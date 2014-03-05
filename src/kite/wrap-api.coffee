module.exports = (userlandApi = {}) ->
  api =
    log: ->
      console.log arguments
    warn: ->
      console.warn arguments
    error: ->
      console.error arguments
  api[method] = fn  for own method, fn of userlandApi
  api
