module.exports = class KiteError extends Error
  constructor: (message) ->
    Error.call this
    @message = message
    @name = "KiteError"

  # the predicates these factories make are useful as bluebird catch guards:
  @codeIs = (code) -> (err) -> code is err.code

  @codeIsnt = (code) -> (err) -> code isnt err.code

