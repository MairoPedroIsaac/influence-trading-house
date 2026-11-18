import type { User } from '../auth/context'

// Name to show on screen: first name, else the part of the email before @.
export function displayName(user: User | null | undefined) {
  if (!user) return ''
  return user.first_name || user.email.split('@')[0]
}

export function fullName(user: User | null | undefined) {
  if (!user) return ''
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email.split('@')[0]
}

// Up to two letters for the default avatar, e.g. "Mairo Isaac" -> "MI".
export function initials(user: User | null | undefined) {
  if (!user) return '?'
  const a = user.first_name?.[0] ?? ''
  const b = user.last_name?.[0] ?? ''
  return (a + b || user.email[0]).toUpperCase()
}
