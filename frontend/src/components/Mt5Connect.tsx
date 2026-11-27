import { useEffect, useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import { useToast } from '../toast/useToast'

type KeyInfo = { exists: false } | { exists: true; prefix: string; created_at: string; last_used_at: string | null }

const SERVER = 'http://127.0.0.1:8000'

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function Step({ n, done, active, title, children }: { n: number; done: boolean; active: boolean; title: string; children: ReactNode }) {
  return (
    <li
      className={`flex min-w-0 gap-4 rounded-2xl border p-4 transition-colors sm:p-5 ${
        active ? 'border-fg/40 bg-bg' : 'border-line bg-bg/40'
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          done ? 'bg-buy text-black' : active ? 'bg-fg text-bg' : 'border border-line text-muted'
        }`}
        aria-hidden="true"
      >
        {done ? <Check /> : n}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-bold">
          {title}
          {done && <span className="sr-only"> (done)</span>}
        </p>
        <div className="mt-1.5 space-y-3 text-sm leading-relaxed text-muted">{children}</div>
      </div>
    </li>
  )
}

function CopyChip({ value, label }: { value: string; label: string }) {
  const toast = useToast()
  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      toast.info(`${label} copied`)
    } catch {
      toast.info('Select the text and copy it')
    }
  }
  return (
    <div className="flex max-w-full items-center gap-2 rounded-xl border border-line bg-surface py-1.5 pl-3 pr-1.5">
      <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-fg">{value}</code>
      <button type="button" onClick={() => void copy()} className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-fg hover:border-fg">
        Copy
      </button>
    </div>
  )
}

// Profile section: connect MT5 so trades fill the journal by themselves.
export function Mt5Connect() {
  const toast = useToast()
  const [info, setInfo] = useState<KeyInfo | null>(null)
  const [newKey, setNewKey] = useState('')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    api<KeyInfo>('/mt5/key/')
      .then(setInfo)
      .catch(() => setFailed(true))
  }, [])

  async function makeKey() {
    if (info?.exists && !window.confirm('Make a new key? The old key will stop working, so you must paste the new one into MT5.')) return
    setBusy(true)
    try {
      const res = await api<{ key: string; prefix: string }>('/mt5/key/', { method: 'POST' })
      setNewKey(res.key)
      setInfo({ exists: true, prefix: res.prefix, created_at: new Date().toISOString(), last_used_at: null })
    } catch {
      toast.error('Could not make a key', 'Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  const hasKey = !!info?.exists
  const connected = !!(info?.exists && info.last_used_at)

  return (
    <section aria-labelledby="mt5-title" className="mt-6 overflow-hidden rounded-3xl border border-line bg-surface">
      {/* Top: what it does + status */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 border-b border-line p-5 sm:p-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <p className="text-[13px] uppercase tracking-[0.14em] text-muted">Automatic journal</p>
          <h2 id="mt5-title" className="mt-2 text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">
            Connect MT5. Stop typing trades.
          </h2>
          <p className="mt-3 max-w-[460px] leading-relaxed text-muted">
            Every trade you open or close in MetaTrader 5 lands in your journal by itself, with the result and the strategy.
          </p>
          <div className="mt-5">
            {failed ? (
              <p className="text-sm text-sell">Could not load your connection. Refresh the page to try again.</p>
            ) : !info ? (
              <p className="text-sm text-muted">Checking your connection...</p>
            ) : (
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                  connected ? 'border-buy/40 bg-buy/10 text-buy' : hasKey ? 'border-line text-fg' : 'border-line text-muted'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${connected ? 'animate-pulse-dot bg-buy' : hasKey ? 'bg-fg' : 'bg-muted'}`} />
                {connected
                  ? `Connected · last trade ${info.exists && info.last_used_at ? new Date(info.last_used_at).toLocaleString() : ''}`
                  : hasKey
                    ? 'Key ready · waiting for MT5'
                    : 'Not connected yet'}
              </span>
            )}
          </div>
        </div>

        {/* Picture: MT5 sends to ITH */}
        <div aria-hidden="true" className="flex items-center justify-center gap-3 rounded-2xl border border-line bg-bg px-4 py-8 sm:gap-5">
          <div className="rounded-2xl border border-line bg-surface px-4 py-3 text-center">
            <p className="text-xs text-muted">MetaTrader 5</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-bold">
              EUR/USD <span className="rounded-full bg-sell px-2 py-0.5 text-[10px] font-extrabold text-white">SELL</span>
            </p>
          </div>
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-fg" style={{ animationDelay: `${i * 0.25}s` }} />
            ))}
          </div>
          <div className="rounded-2xl border border-line bg-surface px-4 py-3 text-center">
            <p className="text-xs text-muted">ITH journal</p>
            <p className="tabular mt-1 font-mono text-sm font-bold text-buy">+502.00</p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <ol className="grid grid-cols-[minmax(0,1fr)] gap-3 p-4 sm:p-8 lg:grid-cols-2">
        <Step n={1} done={hasKey} active={!hasKey} title="Make your private key">
          <p>This key lets MT5 send trades to your account only. Keep it secret.</p>
          {newKey ? (
            <>
              <p className="font-semibold text-fg">Your key, shown only once. Copy it now:</p>
              <CopyChip value={newKey} label="Key" />
            </>
          ) : (
            <button
              type="button"
              onClick={() => void makeKey()}
              disabled={busy || !info}
              className="inline-flex h-11 items-center rounded-full bg-fg px-5 text-sm font-bold text-bg hover:opacity-90 disabled:opacity-50"
            >
              {busy ? 'Making key...' : hasKey ? 'Make a new key' : 'Make my key'}
            </button>
          )}
        </Step>

        <Step n={2} done={connected} active={hasKey && !connected} title="Add the ITH Reporter to MT5">
          <p>
            Copy <span className="font-semibold text-fg">ITH_Reporter.mq5</span> into MT5 &gt; MQL5 &gt; Experts, open it in MetaEditor and click Compile.
          </p>
        </Step>

        <Step n={3} done={connected} active={hasKey && !connected} title="Let MT5 talk to ITH">
          <p>In MT5 open Tools &gt; Options &gt; Expert Advisors. Tick &quot;Allow WebRequest for listed URL&quot; and add this address:</p>
          <CopyChip value={SERVER} label="Address" />
        </Step>

        <Step n={4} done={connected} active={hasKey && !connected} title="Switch it on">
          <p>
            Drag ITH Reporter onto any chart, paste your key into <span className="font-mono text-fg">InpKey</span> and click OK. Turn on Algo Trading. It
            never places trades, it only reports them.
          </p>
        </Step>
      </ol>
    </section>
  )
}
