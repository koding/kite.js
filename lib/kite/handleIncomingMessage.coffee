parse = require 'try-json-parse'
handleAuth = require './auth'

mungeCallbacks = (callbacks, n) ->
  # FIXME: this is an ugly hack; there must be a better way to implement it:
  for own k, c of callbacks
    if (c.join '.') is '0.responseCallback'
      callbacks[k] = [n]
    if c[1] is 'withArgs'
      # since we're rewriting the protocol for the withArgs case, we need to remove everything up to withArgs
      callbacks[k] = c.slice 2
  callbacks

module.exports = (proto, message) ->

  @emit 'debug', "Receiving: #{ message }"

  req = parse message

  unless req?
    @emit 'warning', new KiteError "Invalid payload! (#{ message })"
    return

  { arguments: args, links, callbacks, method, authentication: auth } = req

  if args.length > 0
    [{ withArgs, responseCallback, kite, authentication: auth }] = args

  if !withArgs? and !responseCallback?
    @emit 'debug', "Handling a normal dnode message"
    return proto.handle req

  @emit 'debug', "Authenticating request"

  handleAuth.call(this, method, auth, @key).then (token) =>
    @emit 'debug', "Authentication passed"

    withArgs ?= []

    withArgs = [withArgs]  unless Array.isArray withArgs

    mungeCallbacks callbacks, withArgs.length

    # set this as the current token for the duration of the synchronous method call.
    # NOTE: this mechanism may be changed at some point in the future.
    @currentToken = token

    proto.handle {
      method
      arguments: [withArgs..., responseCallback]
      links
      callbacks
    }

    @currentToken = null

  .catch (err) =>
    @emit 'debug', "Authentication failed"

    mungeCallbacks callbacks, 1

    proto.handle {
      method: 'kite.echo'
      arguments: [err, responseCallback]
      links
      callbacks
    }

