module.exports = ->
  now = new Date
  new Date(
    now.getUTCFullYear()
    now.getUTCMonth()
    now.getUTCDate()
    now.getUTCHours()
    now.getUTCMinutes()
    now.getUTCSeconds()
  )

