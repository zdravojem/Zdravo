import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import {
  hasSupabaseConfig,
  supabase,
  supabaseConfigError,
} from '../lib/supabase'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, session } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(
    hasSupabaseConfig ? '' : supabaseConfigError,
  )
  const from = location.state?.from?.pathname || '/'

  async function handleSubmit(event) {
    event.preventDefault()

    if (!supabase) {
      setError(supabaseConfigError)
      return
    }

    setSaving(true)
    setError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setSaving(false)
      return
    }

    navigate(from, { replace: true })
  }

  if (loading) {
    return <main className="auth-page">Checking session...</main>
  }

  if (session) {
    return <Navigate to={from} replace />
  }

  return (
    <main className="auth-page">
      <form className="auth-panel" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Zdravo Admin</p>
          <h1>Login</h1>
        </div>

        {error ? <p className="notice error">{error}</p> : null}

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <button
          className="button primary"
          type="submit"
          disabled={saving || !hasSupabaseConfig}
        >
          {saving ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </main>
  )
}

export default LoginPage
