import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ToastContext, type Toast, type ToastKind } from './context'

const DURATION_MS = 4000
let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const push = useCallback((kind: ToastKind, title: string, text?: string) => {
    const id = nextId++
    // Keep at most 3 on screen.
    setToasts((list) => [...list.slice(-2), { id, kind, title, text }])
  }, [])

  const api = useMemo(
    () => ({
      success: (title: string, text?: string) => push('success', title, text),
      error: (title: string, text?: string) => push('error', title, text),
      info: (title: string, text?: string) => push('info', title, text),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const bar: Record<ToastKind, string> = {
  success: 'bg-buy',
  error: 'bg-sell',
  info: 'bg-fg',
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: number) => void }) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const show = requestAnimationFrame(() => setShown(true))
    const hide = window.setTimeout(() => onClose(toast.id), DURATION_MS)
    return () => {
      cancelAnimationFrame(show)
      window.clearTimeout(hide)
    }
  }, [onClose, toast.id])

  return (
    <div
      role={toast.kind === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto flex w-full max-w-sm overflow-hidden rounded-lg border border-line bg-surface shadow-lg shadow-black/40 transition-all duration-200 sm:w-96 ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      <span className={`w-1 shrink-0 ${bar[toast.kind]}`} />
      <div className="flex-1 px-4 py-3">
        <p className="text-sm font-medium text-fg">{toast.title}</p>
        {toast.text && <p className="mt-0.5 text-sm text-muted">{toast.text}</p>}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        aria-label="Close notification"
        className="px-3 text-muted hover:text-fg"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
