module.exports = class Delayed

  @handles = []

  constructor: (@fn, @ms, @params...) ->
    Delayed.handles.push this
    @begin()

  begin: -> throw new Error 'not implemented'

  clear: -> throw new Error 'not implemented'

  @clearAll: ->
    @handles.forEach (h) -> h.clear()
    @handles.length = 0
