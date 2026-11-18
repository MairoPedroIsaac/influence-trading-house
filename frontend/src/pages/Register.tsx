import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
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

export default function Register() {
  const { user, register, loginWithGoogle } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value })

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('The two passwords do not match.')
      return
    }
    setBusy(true)
    try {
      const u = await register({
        email: form.email.trim(),
        password: form.password,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
      })
      toast.success(`Welcome to Influence Trading House, ${displayName(u)}`, 'Your account is ready.')
      navigate('/dashboard', { replace: true, state: { newAccount: true } })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  async function onGoogle(credential: string) {
    setError('')
    try {
      const u = await loginWithGoogle(credential)
      toast.success(`Welcome, ${displayName(u)}`, 'You are logged in with Google.')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Google sign up failed. Try again.')
    }
  }

  return (
    <AuthCard title="Create your account">
      {googleEnabled && (
        <>
          <GoogleButton onCredential={onGoogle} />
          <OrDivider />
        </>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First name" id="first_name" autoComplete="given-name" value={form.first_name} onChange={set('first_name')} />
          <FormField label="Last name" id="last_name" autoComplete="family-name" value={form.last_name} onChange={set('last_name')} />
        </div>
        <FormField label="Email" id="email" type="email" autoComplete="email" required value={form.email} onChange={set('email')} />
        <PasswordField
          label="Password"
          id="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={form.password}
          onChange={set('password')}
        />
        <PasswordField
          label="Confirm password"
          id="confirm"
          autoComplete="new-password"
          required
          value={form.confirm}
          onChange={set('confirm')}
        />
        <p className="text-xs text-muted">At least 8 characters. Not all numbers, and not a common password.</p>
        {error && <Notice kind="error">{error}</Notice>}
        <SubmitButton busy={busy} busyText="Creating account...">
          Create account
        </SubmitButton>
      </form>
      <p className="mt-6 text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-fg underline underline-offset-4">
          Log in
        </Link>
      </p>
    </AuthCard>
  )
}
