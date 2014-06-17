test = require 'tape'

Kite = require '../promises.js'

test 'kite server: ping over WebSocket', (t) ->
  t.plan 1

  server = require './lib/server/websocket.coffee'
  server.listen 7777

  kite = new Kite 'http://localhost:7777'

  kite.tell('kite.ping').then (pong) ->
    t.equal pong, 'pong'

  .finally ->
    kite.disconnect()
    server.close()
    t.end()

test 'kite server: ping over SockJs', (t) ->
  t.plan 1

  server = require './lib/server/sockjs.coffee'
  server.listen 7777

  SockJs = require 'node-sockjs-client'

  kite = new Kite
    url: 'http://localhost:7777'
    transportClass: SockJs

  kite.tell('kite.ping').then (pong) ->
    t.equal pong, 'pong'

  .finally ->
    kite.disconnect()
    server.close()
    t.end()
