import { useEffect, useRef, useState } from 'react'
import { GOOGLE_CLIENT_ID as CLIENT_ID } from '../lib/google'

// "Continue with Google" button using Google Identity Services.
// Shows nothing if VITE_GOOGLE_CLIENT_ID is not set.

type GoogleId = {
  initialize: (config: { client_id: string; callback: (res: { credential: string }) => void; ux_mode?: string }) => void
  renderButton: (el: HTMLElement, options: Record<string, string | number>) => void
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } }
  }
}

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

let scriptPromise: Promise<void> | null = null
function loadScript() {
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Could not load Google sign in'))
    document.head.appendChild(s)
  })
  return scriptPromise
}

export function GoogleButton({ onCredential }: { onCredential: (credential: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const callback = useRef(onCredential)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    callback.current = onCredential
  }, [onCredential])

  useEffect(() => {
    const clientId = CLIENT_ID
    if (!clientId) return
    let active = true
    loadScript()
      .then(() => {
        const el = ref.current
        if (!active || !el || !window.google) return
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (res) => callback.current(res.credential),
        })
        window.google.accounts.id.renderButton(el, {
          theme: 'filled_black',
          size: 'large',
          shape: 'rectangular',
          text: 'continue_with',
          width: Math.min(400, el.offsetWidth || 320),
        })
      })
      .catch(() => active && setFailed(true))
    return () => {
      active = false
    }
  }, [])

  if (!CLIENT_ID) return null
  if (failed) return <p className="text-center text-sm text-muted">Google sign in is not available right now.</p>
  return <div ref={ref} className="flex min-h-11 w-full max-w-full justify-center overflow-hidden" />
}
