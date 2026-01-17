import { issueJWT } from '@/lib/auth/jwt'
import { issuePASETO } from '@/lib/auth/paseto'
import { issueOpaqueToken } from '@/lib/auth/opaque'

export default async function handler(req, res) {
  const user = { sub: 'user123', role: 'user' }
  const mode = req.headers.authmode;

  let token
  if (mode === 'jwt') token = await issueJWT(user)
  if (mode === 'paseto') token = await issuePASETO(user)
  if (mode === 'opaque') token = issueOpaqueToken(user)

  res.json({ token })
}