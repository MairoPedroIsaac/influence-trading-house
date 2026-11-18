import type { User } from '../auth/context'
import { initials } from '../lib/user'

// Default avatar: the user's initials in a circle.
// Later this shows the uploaded profile photo when the user has one.
export function Avatar({ user, size = 32 }: { user: User | null | undefined; size?: number }) {
  return (
    <span
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      className="flex shrink-0 select-none items-center justify-center rounded-full border border-line bg-fg font-semibold text-bg"
      aria-hidden="true"
    >
      {initials(user)}
    </span>
  )
}
