import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { useAuth } from '../auth/useAuth'
import type { User } from '../auth/context'
import { FormField } from '../components/FormField'
import { Notice } from '../components/Notice'
import { PasswordField } from '../components/PasswordField'
import { AppLayout } from '../layouts/AppLayout'
import { Avatar } from '../components/Avatar'
import { fullName } from '../lib/user'
import { api, ApiError } from '../lib/api'
import { useToast } from '../toast/useToast'
import { setTheme, useThemeChoice, type ThemeChoice } from '../lib/theme'

function Section({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-b border-line py-10 md:grid-cols-3">
      <div>
        <h2 className="font-medium">{title}</h2>
        <p className="mt-1 text-sm text-muted">{text}</p>
      </div>
      <div className="md:col-span-2">{children}</div>
    </section>
  )
}

function SaveButton({ busy }: { busy: boolean }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="rounded-md bg-fg px-4 py-2 text-sm font-medium text-bg hover:opacity-90 disabled:opacity-50"
    >
      {busy ? 'Saving...' : 'Save'}
    </button>
  )
}

const MAX_PHOTO_BYTES = 2 * 1024 * 1024

function PhotoForm({ user }: { user: User }) {
  const { setUser } = useAuth()
  const toast = useToast()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow choosing the same file again
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Use a JPG, PNG or WebP photo.')
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error('Photo is too big', 'The limit is 2 MB.')
      return
    }
    const body = new FormData()
    body.append('avatar', file)
    setBusy(true)
    try {
      setUser(await api<User>('/auth/me/avatar/', { method: 'POST', body }))
      toast.success('Profile photo updated')
    } catch (err) {
      toast.error('Upload failed', err instanceof ApiError ? err.message : 'Try again.')
    } finally {
      setBusy(false)
    }
  }

  async function onRemove() {
    setBusy(true)
    try {
      setUser(await api<User>('/auth/me/avatar/', { method: 'DELETE' }))
      toast.info('Profile photo removed')
    } catch {
      toast.error('Could not remove the photo. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-5">
      <Avatar user={user} size={72} />
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => input.current?.click()}
            className="rounded-md bg-fg px-4 py-2 text-sm font-medium text-bg hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Saving...' : user.avatar_url ? 'Change photo' : 'Upload photo'}
          </button>
          {user.avatar_url && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onRemove()}
              className="rounded-md border border-line px-4 py-2 text-sm text-muted hover:text-fg disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-muted">JPG, PNG or WebP, up to 2 MB. We crop it to a square.</p>
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => void onFile(e)} />
    </div>
  )
}

function DetailsForm({ user }: { user: User }) {
  const { setUser } = useAuth()
  const toast = useToast()
  const [first, setFirst] = useState(user.first_name)
  const [last, setLast] = useState(user.last_name)
  const [msg, setMsg] = useState<{ kind: 'error' | 'success'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setMsg(null)
    setBusy(true)
    try {
      const updated = await api<User>('/auth/me/', {
        method: 'PATCH',
        body: JSON.stringify({ first_name: first.trim(), last_name: last.trim() }),
      })
      setUser(updated)
      toast.success('Details saved')
    } catch (err) {
      setMsg({ kind: 'error', text: err instanceof ApiError ? err.message : 'Could not save. Try again.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="First name" id="first_name" value={first} onChange={(e) => setFirst(e.target.value)} />
        <FormField label="Last name" id="last_name" value={last} onChange={(e) => setLast(e.target.value)} />
      </div>
      <FormField label="Email" id="email" value={user.email} disabled readOnly />
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <SaveButton busy={busy} />
    </form>
  )
}

function PasswordForm({ user }: { user: User }) {
  const { setUser } = useAuth()
  const toast = useToast()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState<{ kind: 'error' | 'success'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setMsg(null)
    if (next !== confirm) {
      setMsg({ kind: 'error', text: 'The two new passwords do not match.' })
      return
    }
    setBusy(true)
    try {
      await api('/auth/password/change/', {
        method: 'POST',
        body: JSON.stringify({ current_password: current, new_password: next }),
      })
      setCurrent('')
      setNext('')
      setConfirm('')
      if (!user.has_password) setUser({ ...user, has_password: true })
      if (user.has_password) toast.success('Password changed')
      else toast.success('Password set', 'You can now also log in with your email.')
    } catch (err) {
      setMsg({ kind: 'error', text: err instanceof ApiError ? err.message : 'Could not change password. Try again.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      {user.has_password && (
        <PasswordField
          label="Current password"
          id="current_password"
          autoComplete="current-password"
          required
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
      )}
      <PasswordField
        label="New password"
        id="new_password"
        autoComplete="new-password"
        minLength={8}
        required
        value={next}
        onChange={(e) => setNext(e.target.value)}
      />
      <PasswordField
        label="Confirm new password"
        id="confirm_password"
        autoComplete="new-password"
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <SaveButton busy={busy} />
    </form>
  )
}

function ThemePicker() {
  const theme = useThemeChoice()
  const options: { value: ThemeChoice; label: string }[] = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
    { value: 'system', label: 'System' },
  ]
  return (
    <div role="radiogroup" aria-label="Theme" className="inline-flex rounded-md border border-line p-1">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={theme === o.value}
          onClick={() => setTheme(o.value)}
          className={`rounded px-4 py-1.5 text-sm ${
            theme === o.value ? 'bg-fg font-medium text-bg' : 'text-muted hover:text-fg'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function Profile() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <AppLayout title="Profile">
      <div className="flex items-center gap-4">
        <Avatar user={user} size={64} />
        <div>
          <p className="text-lg font-medium">{fullName(user)}</p>
          <p className="text-sm text-muted">
            Member since {new Date(user.date_joined).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <Section title="Profile photo" text="Shown in the sidebar and on your profile. Without a photo we show your initials.">
        <PhotoForm user={user} />
      </Section>

      <Section title="Your details" text="Your name as it shows in ITH. Email cannot be changed.">
        <DetailsForm user={user} />
      </Section>

      <Section
        title={user.has_password ? 'Change password' : 'Set a password'}
        text={
          user.has_password
            ? 'Use a strong password you do not use anywhere else.'
            : 'You signed up with Google. Set a password to also log in with your email.'
        }
      >
        <PasswordForm user={user} />
      </Section>

      <Section title="Appearance" text="Choose how your dashboard looks. System follows your device setting. Saved on this device.">
        <ThemePicker />
      </Section>
    </AppLayout>
  )
}
