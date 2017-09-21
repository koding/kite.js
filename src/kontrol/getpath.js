export default function getPath(query) {
  const val = query.username
  const username = val != null ? val : ''
  const val1 = query.environment
  const environment = val1 != null ? val1 : ''
  const val2 = query.name
  const name = val2 != null ? val2 : ''
  const val3 = query.version
  const version = val3 != null ? val3 : ''
  const val4 = query.region
  const region = val4 != null ? val4 : ''
  const val5 = query.hostname
  const hostname = val5 != null ? val5 : ''
  const val6 = query.id
  const id = val6 != null ? val6 : ''

  return `${username}/${environment}/${name}/${version}/${region}/${hostname}/${id}`
}
