// Main form button. Shows a spinner and the busy text while the form is sending.
export function SubmitButton({ busy, busyText, children }: { busy: boolean; busyText: string; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy}
      aria-busy={busy}
      className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-fg font-bold text-bg transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
    >
      {busy && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {busy ? busyText : children}
    </button>
  )
}
