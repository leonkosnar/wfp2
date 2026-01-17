import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'auth.db')

export const db = new Database(dbPath)

// One-time schema setup
db.exec(`
  CREATE TABLE IF NOT EXISTS opaque_tokens (
    token TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    role TEXT,
    expires_at INTEGER
  );
`)