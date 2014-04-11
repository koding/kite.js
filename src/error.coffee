module.exports = class KiteError extends Error
  constructor: (message) ->
    Error.call this
    @message = message
    @name = "KiteError"
