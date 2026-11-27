import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { api } from '../lib/api'
import type { Trade } from '../lib/trades'

// Results per strategy, worked out from the trades in the journal.
type Row = { name: string; trades: number; open: number; closed: number; wins: number; pnl: number; avgR: number | null }

function summarise(list: Trade[]): Row[] {
  const map = new Map<string, Trade[]>()
  for (const t of list) {
    const key = t.strategy || 'No strategy'
    map.set(key, [...(map.get(key) ?? []), t])
  }
  return [...map.entries()]
    .map(([name, ts]) => {
      const closed = ts.filter((t) => t.status !== 'OPEN')
      const rr = ts.map((t) => t.risk_reward).filter((v): v is number => v !== null)
      return {
        name,
        trades: ts.length,
        open: ts.length - closed.length,
        closed: closed.length,
        wins: closed.filter((t) => t.status === 'WIN').length,
        pnl: closed.reduce((s, t) => s + Number(t.profit ?? 0), 0),
        avgR: rr.length ? rr.reduce((a, b) => a + b, 0) / rr.length : null,
      }
    })
    .sort((a, b) => b.trades - a.trades)
}

export default function StrategiesApp() {
  const [trades, setTrades] = useState<Trade[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    api<Trade[]>('/trades/')
      .then(setTrades)
      .catch(() => {
        setFailed(true)
        setTrades([])
      })
  }, [])

  const rows = summarise(trades ?? [])

  return (
    <AppLayout title="Strategies">
      <p className="max-w-[620px] text-muted">
        Every strategy you tag in your journal gets its own numbers here, so you can see which one really pays.
      </p>

      {failed && (
        <p role="alert" className="mt-6 rounded-xl border border-sell/40 bg-sell/10 px-4 py-3 text-sm text-sell">
          We could not load your trades. Check your connection and refresh the page.
        </p>
      )}

      {trades === null ? (
        <p className="mt-10 text-center text-sm text-muted">Loading your strategies...</p>
      ) : rows.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-line bg-surface px-6 py-14 text-center">
          <p className="text-lg font-bold">No strategies yet</p>
          <p className="mt-1 text-sm text-muted">Log a trade and pick a strategy. It will show up here.</p>
          <Link to="/journal" className="mt-6 inline-flex h-11 items-center rounded-full bg-fg px-5 text-sm font-bold text-bg hover:opacity-90">
            Open trade journal
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((r) => {
            const rate = r.closed ? Math.round((r.wins / r.closed) * 100) : null
            return (
              <article key={r.name} className="flex flex-col rounded-3xl border border-line bg-surface p-6">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-2xl font-extrabold tracking-[-0.03em]">{r.name}</h2>
                  <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
                    {r.trades} {r.trades === 1 ? 'trade' : 'trades'}
                  </span>
                </div>

                <div className="mt-6">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted">Win rate</span>
                    <span className="tabular font-mono text-xl font-semibold">{rate === null ? '-' : `${rate}%`}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
                    {rate !== null && <div className={`h-full rounded-full ${rate >= 50 ? 'bg-buy' : 'bg-sell'}`} style={{ width: `${Math.max(rate, 2)}%` }} />}
                  </div>
                </div>

                <dl className="tabular mt-6 grid grid-cols-3 gap-2 font-mono text-sm">
                  <div className="rounded-xl border border-line px-3 py-2.5">
                    <dt className="font-sans text-[11px] text-muted">P/L</dt>
                    <dd className={`mt-1 font-semibold ${r.closed === 0 ? 'text-muted' : r.pnl >= 0 ? 'text-buy' : 'text-sell'}`}>
                      {r.closed === 0 ? '-' : `${r.pnl >= 0 ? '+' : ''}${r.pnl.toFixed(2)}`}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-line px-3 py-2.5">
                    <dt className="font-sans text-[11px] text-muted">Avg R:R</dt>
                    <dd className="mt-1 font-semibold">{r.avgR === null ? '-' : r.avgR.toFixed(1)}</dd>
                  </div>
                  <div className="rounded-xl border border-line px-3 py-2.5">
                    <dt className="font-sans text-[11px] text-muted">Open</dt>
                    <dd className="mt-1 font-semibold">{r.open}</dd>
                  </div>
                </dl>
              </article>
            )
          })}
        </div>
      )}
    </AppLayout>
  )
}
