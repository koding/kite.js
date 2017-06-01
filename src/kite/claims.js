const atob = require('atob')
const parse = require('try-json-parse')

module.exports = kiteKey => {
  const [_, kontrolClaimsA] = Array.from(kiteKey.split('.'))
  return parse(atob(kontrolClaimsA))
}
