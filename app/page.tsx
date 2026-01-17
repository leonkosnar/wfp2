'use client'

import { useState } from 'react'

type AuthMode = 'jwt' | 'paseto' | 'opaque'

export default function Home() {
  const [authMode, setAuthMode] = useState<AuthMode>('jwt')
  const [token, setToken] = useState<string | null>(null)
  const [response, setResponse] = useState<string>('')

  async function getToken() {
    setResponse('')
    const res = await fetch(`/api/login`, {
      method: 'POST',
      headers: {
        AuthMode: authMode
      }
    })
    const data = await res.json()
    setToken(data.token)
  }

  async function fetchData() {
    if (!token) return

    const res = await fetch(`/api/resource`, {
      headers: {
        Authorization: `Bearer ${token}`,
        AuthMode: authMode
      },
    })

    const text = await res.text()
    setResponse(text)
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Authentication Mechanism Test Harness</h1>

      <label>
        Authentication Type:{' '}
        <select
          value={authMode}
          onChange={(e) => setAuthMode(e.target.value as AuthMode)}
        >
          <option value="jwt">JWT</option>
          <option value="paseto">PASETO</option>
          <option value="opaque">Opaque Token</option>
        </select>
      </label>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={getToken}>Get Token</button>
      </div>

      <h3>Token</h3>
      <pre
        style={{
          padding: '1rem',
          background: '#f5f5f5',
          overflowX: 'auto',
        }}
      >
        {token ?? 'No token issued'}
      </pre>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={fetchData} disabled={!token}>
          Fetch Protected Resource
        </button>
      </div>

      <h3>Response</h3>
      <pre
        style={{
          padding: '1rem',
          background: '#f5f5f5',
          overflowX: 'auto',
        }}
      >
        {response || 'No response'}
      </pre>
    </main>
  )
}