// Small message box: red for errors, green for success.
export function Notice({ kind, children }: { kind: 'error' | 'success'; children: React.ReactNode }) {
  const style = kind === 'error' ? 'border-sell/40 text-sell' : 'border-buy/40 text-buy'
  return (
    <p role={kind === 'error' ? 'alert' : 'status'} className={`rounded-md border px-3 py-2 text-sm ${style}`}>
      {children}
    </p>
  )
}
