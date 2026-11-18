export function SubmitButton({ busy, busyText, children }: { busy: boolean; busyText: string; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full rounded-md bg-fg py-2.5 font-medium text-bg hover:opacity-90 disabled:opacity-50"
    >
      {busy ? busyText : children}
    </button>
  )
}
