import { verifyJWT } from './jwt'
import { verifyPASETO } from './paseto'
import { verifyOpaqueToken } from './opaque'

export async function verifyToken(
  token: string,
  mode: 'jwt' | 'paseto' | 'opaque'
) {
  switch (mode) {
    case 'jwt':
      return await verifyJWT(token)
    case 'paseto':
      return await verifyPASETO(token)
    case 'opaque':
      return verifyOpaqueToken(token)
  }
}