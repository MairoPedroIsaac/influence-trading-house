import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Notice } from '../components/Notice'
import { PasswordField } from '../components/PasswordField'
import { SubmitButton } from '../components/SubmitButton'
import { api, ApiError } from '../lib/api'
import { useToast } from '../toast/useToast'
import AuthCard from './AuthCard'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const uid = params.get('uid') ?? ''
  const token = params.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!uid || !token) {
    return (
      <AuthCard title="Reset password">
        <Notice kind="error">This reset link is not complete. Ask for a new one.</Notice>
        <p className="mt-6 text-sm">
          <Link to="/forgot-password" className="underline underline-offset-4">
            Get a new link
          </Link>
        </p>
      </AuthCard>
    )
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('The two passwords do not match.')
      return
    }
    setBusy(true)
    try {
      await api('/auth/password/reset/', {
        method: 'POST',
        body: JSON.stringify({ uid, token, new_password: password }),
      })
      toast.success('Password reset', 'Log in with your new password.')
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard title="Choose a new password">
      <form onSubmit={onSubmit} className="space-y-4">
        <PasswordField
          label="New password"
          id="new_password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordField
          label="Confirm new password"
          id="confirm"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <p className="text-xs text-muted">At least 8 characters. Not all numbers, and not a common password.</p>
        {error && <Notice kind="error">{error}</Notice>}
        <SubmitButton busy={busy} busyText="Saving...">
          Save new password
        </SubmitButton>
      </form>
      {error.includes('link') && (
        <p className="mt-6 text-sm">
          <Link to="/forgot-password" className="underline underline-offset-4">
            Get a new link
          </Link>
        </p>
      )}
    </AuthCard>
  )
}
