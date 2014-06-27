{ keys } = Object

test = require 'tape'

{ registered, dispatched } = require './record-events.coffee'

test 'dump event report', (t) ->

  console.log """

    EVENT REPORT:

    Unique events registered:
    #{ (keys registered).join ', ' }

    Unique events dispatched:
    #{ (keys dispatched).join ', ' }

  """

  t.end()