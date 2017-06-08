import jwt from 'jwt-simple'
import atob from 'atob'
import parse from 'try-json-parse'
import getKontrolClaims from './claims'

export default (tokenString, kiteKey) => {
  const [headersA] = tokenString.split('.')
  const kontrolClaims = getKontrolClaims(kiteKey)
  const headers = parse(atob(headersA))
  const claims = jwt.decode(tokenString, kontrolClaims.kontrolKey)
  return { headers, claims }
}
