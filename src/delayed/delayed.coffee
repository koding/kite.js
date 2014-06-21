module.exports = class Delayed

  @handles = []

  constructor: (@ms, @fn, @params...) ->
    Delayed.handles.push this

  begin: -> throw new Error 'not implemented'

  clear: -> throw new Error 'not implemented'

  @clearAll: ->
    @handles.forEach (h) -> h.clear()
    @handles.length = 0
