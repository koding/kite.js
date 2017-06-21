import dnode from 'dnode-protocol'
import wrap from './wrap'

export default function createProto({ kite, api }) {
  return dnode(wrap.call(kite, api))
}
