handleAuth = require './auth/auth.coffee'

module.exports = (proto, message) ->
  req = try JSON.parse message

  unless req?
    @emit 'warning', new KiteError "Invalid payload! (#{ message })"
    return

  { arguments: args, links, callbacks, method, authentication: auth } = req

  [{ withArgs, responseCallback, kite, authentication: auth }] = args

  handleAuth(auth, @key).then (token) ->

    console.log token
    if !withArgs? and !responseCallback?
      # it's a normal dnode protocol message.
      proto.handle req
      return

    # it's a kite protocol message.
    withArgs ?= []

    withArgs = [withArgs]  unless Array.isArray withArgs

    # FIXME: this is an ugly hack; there must be a better way to implement it:
    for own k, c of callbacks
      if (c.join '.') is '0.responseCallback'
        callbacks[k] = [withArgs.length]
      if c[1] is 'withArgs'
        # since we're rewriting the protocol for the withArgs case, we need to remove everything up to withArgs
        callbacks[k] = c.slice 2

    proto.handle {
      method
      arguments: [withArgs..., responseCallback]
      links
      callbacks
    }
