module.exports = class Delayed

  mustOverride = -> throw new Error 'not implemented'

  @handles = []

  constructor: (@fn, @ms, @params...) ->
    Delayed.handles.push this
    @begin()

  begin: mustOverride

  clear: mustOverride

  @clearAll: ->
    @handles.forEach (h) -> h.clear()
    @handles.length = 0

