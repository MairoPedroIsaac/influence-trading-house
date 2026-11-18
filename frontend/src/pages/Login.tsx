import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { FormField } from '../components/FormField'
import { GoogleButton } from '../components/GoogleButton'
import { googleEnabled } from '../lib/google'
import { Notice } from '../components/Notice'
import { OrDivider } from '../components/OrDivider'
import { PasswordField } from '../components/PasswordField'
import { SubmitButton } from '../components/SubmitButton'
import { ApiError } from '../lib/api'
import { useToast } from '../toast/useToast'
import { displayName } from '../lib/user'
import AuthCard from './AuthCard'

export default function Login() {
  const { user, login, loginWithGoogle } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { from?: string; message?: string } | null
  const from = state?.from ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={from} replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const u = await login(email.trim().toLowerCase(), password)
      toast.success(`Welcome back, ${displayName(u)}`, 'You are logged in.')
      navigate(from, { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // Same message whether the email or the password is wrong.
        setError('Email or password is incorrect.')
      } else if (err instanceof ApiError && err.status === 429) {
        setError('Too many attempts. Wait a minute and try again.')
      } else {
        setError('Cannot reach the server. Check that the backend is running, then try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  async function onGoogle(credential: string) {
    setError('')
    try {
      const u = await loginWithGoogle(credential)
      toast.success(`Welcome back, ${displayName(u)}`, 'You are logged in with Google.')
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Google sign in failed. Try again.')
    }
  }

  return (
    <AuthCard title="Log in">
      {state?.message && (
        <div className="mb-4">
          <Notice kind="success">{state.message}</Notice>
        </div>
      )}
      {googleEnabled && (
        <>
          <GoogleButton onCredential={onGoogle} />
          <OrDivider />
        </>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          label="Email"
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div>
          <PasswordField
            label="Password"
            id="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="mt-2 text-right">
            <Link to="/forgot-password" className="text-sm text-muted hover:text-fg">
              Forgot password?
            </Link>
          </div>
        </div>
        {error && <Notice kind="error">{error}</Notice>}
        <SubmitButton busy={busy} busyText="Logging in...">
          Log in
        </SubmitButton>
      </form>
      <p className="mt-6 text-sm text-muted">
        No account yet?{' '}
        <Link to="/register" className="text-fg underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </AuthCard>
  )
}
