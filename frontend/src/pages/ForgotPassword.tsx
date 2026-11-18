import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { FormField } from '../components/FormField'
import { Notice } from '../components/Notice'
import { SubmitButton } from '../components/SubmitButton'
import { api, ApiError } from '../lib/api'
import AuthCard from './AuthCard'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api('/auth/password/forgot/', { method: 'POST', body: JSON.stringify({ email: email.trim() }) })
      setSent(true)
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 429
          ? 'Too many requests. Try again later.'
          : 'Something went wrong. Try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard title="Forgot your password?">
      {sent ? (
        <div className="space-y-4">
          <Notice kind="success">
            If an account exists for {email.trim()}, we have sent a link to reset your password. It works for 1 hour.
          </Notice>
          <p className="text-sm text-muted">Check your spam folder if you do not see it in a few minutes.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <p className="text-sm text-muted">Enter your email and we will send you a link to choose a new password.</p>
          <FormField
            label="Email"
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <Notice kind="error">{error}</Notice>}
          <SubmitButton busy={busy} busyText="Sending...">
            Send reset link
          </SubmitButton>
        </form>
      )}
      <p className="mt-6 text-sm text-muted">
        <Link to="/login" className="text-fg underline underline-offset-4">
          Back to log in
        </Link>
      </p>
    </AuthCard>
  )
}
