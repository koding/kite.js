test = require 'tape'

Kite = require '../promises.js'

test 'disable authentication', (t) ->
  t.plan 2

  server = require './lib/server/noauth.coffee'
  server.listen 7777

  kite = new Kite 'http://localhost:7777/noauth'

  kite.tell 'noAuth'

  .then (greeting) ->
    t.equal greeting, 'yep'

  .catch (err) ->
    t.ok no

  .then ->
    kite.tell 'yesAuth'

  .then ->
    t.ok no

  .catch (err) ->
    t.equal err.message, 'Access denied!'

  .finally ->
    kite.disconnect()
    server.close()
    t.end()
