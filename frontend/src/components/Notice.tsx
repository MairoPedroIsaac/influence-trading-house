// Small message box: red for errors, green for success.
export function Notice({ kind, children }: { kind: 'error' | 'success'; children: React.ReactNode }) {
  const style = kind === 'error' ? 'border-sell/40 bg-sell/10 text-sell' : 'border-buy/40 bg-buy/10 text-buy'
  return (
    <p role={kind === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${style}`}>
      {children}
    </p>
  )
}
