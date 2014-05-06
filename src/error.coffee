module.exports = class KiteError extends Error
  constructor: (message) ->
    Error.call this
    @message = message
    @name = "KiteError"

  @codeIs = (code) -> (err) -> code is err.code

  @codeIsnt = (code) -> (err) -> code isnt err.code
