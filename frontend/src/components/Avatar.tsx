import { useState } from 'react'
import type { User } from '../auth/context'
import { initials } from '../lib/user'

// Profile photo if the user has one, otherwise their initials in a circle.
export function Avatar({ user, size = 32 }: { user: User | null | undefined; size?: number }) {
  const url = user?.avatar_url ?? null
  // If the photo link fails (for example it expired), fall back to initials.
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const showPhoto = url && failedUrl !== url

  return (
    <span
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      className="flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full border border-line bg-fg font-semibold text-bg"
      aria-hidden="true"
    >
      {showPhoto ? (
        <img src={url} alt="" className="h-full w-full object-cover" onError={() => setFailedUrl(url)} />
      ) : (
        initials(user)
      )}
    </span>
  )
}
