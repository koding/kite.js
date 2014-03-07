module.exports = (timeout, callback) ->
  canceled = no
  setTimeout ->
    canceled = yes
    callback new Error "Timeout exceeded: #{ timeout }ms"
  , timeout
  return -> callback.apply this, arguments  unless canceled
