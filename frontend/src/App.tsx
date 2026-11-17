function App() {
  return (
    <main className="min-h-screen bg-bg text-fg flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-line bg-surface p-6">
        <img src="/brand/ith-logo-horizontal-white.svg" alt="Influence Trading House" className="h-8" />
        <p className="mt-4 text-sm text-muted">Tailwind is working.</p>
        <div className="mt-6 flex gap-3 font-mono text-sm">
          <span className="rounded border border-buy px-3 py-1 text-buy">BUY 1.10002</span>
          <span className="rounded border border-sell px-3 py-1 text-sell">SELL 1.10250</span>
        </div>
      </div>
    </main>
  )
}

export default App
