'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type PageState = 'checking' | 'ready' | 'locked' | 'done'

export default function SetupPage() {
  const router = useRouter()
  const [pageState, setPageState] = useState<PageState>('checking')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/setup')
      .then((r) => r.json())
      .then(({ hasAdmin }) => {
        setPageState(hasAdmin ? 'locked' : 'ready')
      })
      .catch(() => setPageState('ready'))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const res = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    setPageState('done')
    setTimeout(() => router.push('/admin/login'), 2000)
  }

  // ── Checking ─────────────────────────────────────────────
  if (pageState === 'checking') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-orange-500 rounded-full animate-spin" />
      </div>
    )
  }

  // ── Already configured ───────────────────────────────────
  if (pageState === 'locked') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-zinc-800 mb-5">
            <svg className="w-7 h-7 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-white text-xl font-bold mb-2">Already set up</h1>
          <p className="text-gray-500 text-sm mb-6">An admin account already exists. This page is locked.</p>
          <button
            onClick={() => router.push('/admin/login')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors"
          >
            Go to login
          </button>
        </div>
      </div>
    )
  }

  // ── Done ─────────────────────────────────────────────────
  if (pageState === 'done') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/20 mb-5">
            <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-white text-xl font-bold mb-2">Admin account created!</h1>
          <p className="text-gray-500 text-sm">Redirecting to login…</p>
        </div>
      </div>
    )
  }

  // ── Setup form ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-500 mb-4">
            <span className="text-2xl">🏀</span>
          </div>
          <h1 className="text-white text-2xl font-bold">First-time setup</h1>
          <p className="text-gray-500 text-sm mt-1">Create your admin account to manage videos.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 placeholder-gray-600"
              placeholder="you@yourbrand.com"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
              placeholder="Min 8 characters"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
              placeholder="Re-enter password"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors mt-2"
          >
            {loading ? 'Creating account…' : 'Create admin account'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-xs mt-6">
          This page auto-locks once an account is created.
        </p>
      </div>
    </div>
  )
}
