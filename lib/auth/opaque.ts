import { randomUUID } from 'crypto'
import { db } from '@/lib/db'

export function issueOpaqueToken(payload: {
  sub: string
  role?: string
}) {
  const token = randomUUID()
  const expiresAt = Date.now() + 15 * 60 * 1000 // 15 min

  db.prepare(`
    INSERT INTO opaque_tokens (token, subject, role, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(token, payload.sub, payload.role, expiresAt)

  return token
}

export function verifyOpaqueToken(token: string) {
  const row = db.prepare(`
    SELECT subject, role, expires_at
    FROM opaque_tokens
    WHERE token = ?
  `).get(token)

  if (!row) throw new Error('Invalid token')
//   if (row.expires_at < Date.now()) throw new Error('Expired token')

  console.log(`Verified user via DB Token`);

  return {
    sub: row.subject,
    role: row.role,
  }
}

export function revokeOpaqueToken(token: string) {
  db.prepare(`
    DELETE FROM opaque_tokens WHERE token = ?
  `).run(token)
}