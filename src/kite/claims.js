import atob from 'atob'
import parse from 'try-json-parse'

export default kiteKey => {
  const kontrolClaimsA = kiteKey.split('.')[1]
  return parse(atob(kontrolClaimsA))
}
