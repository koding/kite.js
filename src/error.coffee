module.exports = class KiteError extends KiteError
  constructor: (message) ->
    Error.call this, message
    @name = "KiteError"
