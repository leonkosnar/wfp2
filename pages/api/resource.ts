import { verifyToken } from '@/lib/auth/verify'

export default async function handler(req, res) {
  const auth = req.headers.authorization
  const mode = req.headers.authmode;
  if (!auth || !mode) return res.status(401).end()

  const token = auth.replace('Bearer ', '')
  const user = await verifyToken(token, mode)

  // Authorization (BOLA)
  // if (req.query.userId !== user.sub) {
  //   return res.status(403).end()
  // }

  res.json({ data: 'secret data', auth_mode: mode, payload: user })
}