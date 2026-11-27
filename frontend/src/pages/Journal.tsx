import { useCallback, useEffect, useMemo, useState } from 'react'
import { Modal } from '../components/Modal'
import { TradeForm } from '../components/TradeForm'
import { AppLayout } from '../layouts/AppLayout'
import { api } from '../lib/api'
import { money, price, shortDate, STATUS_LABEL, type Status, type Trade } from '../lib/trades'
import { useToast } from '../toast/useToast'

type Filter = 'ALL' | Status
const FILTERS: Filter[] = ['ALL', 'OPEN', 'WIN', 'LOSS', 'BE']

function StatusBadge({ status }: { status: Status }) {
  const style =
    status === 'WIN'
      ? 'border-buy/40 text-buy'
      : status === 'LOSS'
        ? 'border-sell/40 text-sell'
        : 'border-line text-muted'
  return <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style}`}>{STATUS_LABEL[status]}</span>
}

export default function Journal() {
  const toast = useToast()
  const [trades, setTrades] = useState<Trade[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [filter, setFilter] = useState<Filter>('ALL')
  const [symbol, setSymbol] = useState('ALL')
  const [editing, setEditing] = useState<Trade | 'new' | null>(null)

  const load = useCallback(() => {
    api<Trade[]>('/trades/')
      .then((list) => {
        setTrades(list)
        setFailed(false)
      })
      .catch(() => setFailed(true))
  }, [])

  useEffect(load, [load])

  const symbols = useMemo(() => [...new Set((trades ?? []).map((t) => t.symbol))].sort(), [trades])
  const shown = (trades ?? []).filter(
    (t) => (filter === 'ALL' || t.status === filter) && (symbol === 'ALL' || t.symbol === symbol),
  )

  const close = useCallback(() => setEditing(null), [])

  const all = trades ?? []
  const closedList = all.filter((t) => t.status !== 'OPEN')
  const winsCount = closedList.filter((t) => t.status === 'WIN').length
  const totalPnl = closedList.reduce((sum, t) => sum + Number(t.profit ?? 0), 0)

  function onSaved(saved: Trade) {
    const isNew = editing === 'new'
    setTrades((list) => {
      const rest = (list ?? []).filter((t) => t.id !== saved.id)
      return [saved, ...rest].sort((a, b) => b.opened_at.localeCompare(a.opened_at))
    })
    setEditing(null)
    toast.success(isNew ? 'Trade added' : 'Trade updated')
  }

  function onDeleted(id: number) {
    setTrades((list) => (list ?? []).filter((t) => t.id !== id))
    setEditing(null)
    toast.info('Trade deleted')
  }

  return (
    <AppLayout title="Trade journal">
      {/* Summary */}
      <section aria-label="Journal summary" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Trades', value: String(all.length) },
          { label: 'Open', value: String(all.length - closedList.length) },
          { label: 'Win rate', value: closedList.length ? `${Math.round((winsCount / closedList.length) * 100)}%` : '-' },
          { label: 'Profit / loss', value: closedList.length ? `${totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}` : '-', tone: closedList.length ? (totalPnl >= 0 ? 'text-buy' : 'text-sell') : '' },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <p className="text-sm text-muted">{c.label}</p>
            <p className={`tabular mt-2 font-mono text-2xl font-semibold ${c.tone ?? ''}`}>{c.value}</p>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex max-w-full overflow-x-auto rounded-full border border-line p-1" role="radiogroup" aria-label="Filter by result">
          {FILTERS.map((f) => (
            <button
              key={f}
              role="radio"
              aria-checked={filter === f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm ${filter === f ? 'bg-fg font-semibold text-bg' : 'text-muted hover:text-fg'}`}
            >
              {f === 'ALL' ? 'All' : STATUS_LABEL[f]}
            </button>
          ))}
        </div>
        {symbols.length > 1 && (
          <select
            aria-label="Filter by symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="h-10 rounded-full border border-line bg-bg px-4 text-sm text-fg outline-none focus:border-fg"
          >
            <option value="ALL">All symbols</option>
            {symbols.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={() => setEditing('new')}
          className="ml-auto inline-flex h-11 items-center rounded-full bg-fg px-5 text-sm font-bold text-bg hover:opacity-90"
        >
          + Add trade
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-line bg-surface">
        {failed ? (
          <div className="p-8 text-center text-sm text-muted">
            Could not load trades.{' '}
            <button onClick={load} className="text-fg underline underline-offset-4">
              Try again
            </button>
          </div>
        ) : trades === null ? (
          <div className="p-8 text-center text-sm text-muted">Loading trades...</div>
        ) : shown.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium">{trades.length === 0 ? 'No trades yet' : 'No trades match this filter'}</p>
            <p className="mt-1 text-sm text-muted">
              {trades.length === 0
                ? 'Add a trade by hand for now. Soon MT5 will save them here automatically.'
                : 'Try another filter.'}
            </p>
          </div>
        ) : (
          <>
          {/* Phone: cards */}
          <ul className="md:hidden">
            {shown.map((t) => {
              const pnl = t.profit === null ? 0 : Number(t.profit)
              return (
                <li key={t.id} className="border-b border-line last:border-0">
                  <button onClick={() => setEditing(t)} className="flex w-full items-center gap-3 px-4 py-4 text-left">
                    <span className={`w-12 shrink-0 rounded-full py-1 text-center text-[11px] font-extrabold ${t.side === 'BUY' ? 'bg-buy text-black' : 'bg-sell text-white'}`}>
                      {t.side}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{t.symbol}</span>
                      <span className="tabular block truncate font-mono text-xs text-muted">
                        {price(t.lots)} lots at {price(t.entry_price)} · {shortDate(t.opened_at)}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <StatusBadge status={t.status} />
                      <span className={`tabular font-mono text-sm ${pnl > 0 ? 'text-buy' : pnl < 0 ? 'text-sell' : 'text-muted'}`}>{money(t.profit)}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          {/* Laptop: table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-[0.12em] text-muted">
                  <th className="px-4 py-3 font-medium">Opened</th>
                  <th className="px-4 py-3 font-medium">Symbol</th>
                  <th className="px-4 py-3 font-medium">Side</th>
                  <th className="px-4 py-3 text-right font-medium">Lots</th>
                  <th className="px-4 py-3 text-right font-medium">Entry</th>
                  <th className="px-4 py-3 text-right font-medium">SL</th>
                  <th className="px-4 py-3 text-right font-medium">TP</th>
                  <th className="px-4 py-3 text-right font-medium">R:R</th>
                  <th className="px-4 py-3 font-medium">Result</th>
                  <th className="px-4 py-3 text-right font-medium">P/L</th>
                </tr>
              </thead>
              <tbody className="tabular font-mono">
                {shown.map((t) => {
                  const pnl = t.profit === null ? 0 : Number(t.profit)
                  return (
                    <tr
                      key={t.id}
                      onClick={() => setEditing(t)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditing(t)}
                      tabIndex={0}
                      className="cursor-pointer border-b border-line last:border-0 hover:bg-line/40 focus:bg-line/40 focus:outline-none"
                    >
                      <td className="px-4 py-3 font-sans text-muted">{shortDate(t.opened_at)}</td>
                      <td className="px-4 py-3 font-sans font-medium">
                        {t.symbol}
                        {t.source === 'MT5' && <span className="ml-2 rounded-full border border-line px-1.5 py-0.5 text-[10px] font-semibold text-muted">MT5</span>}
                      </td>
                      <td className="px-4 py-3 font-sans">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${t.side === 'BUY' ? 'bg-buy text-black' : 'bg-sell text-white'}`}>{t.side}</span>
                      </td>
                      <td className="px-4 py-3 text-right">{price(t.lots)}</td>
                      <td className="px-4 py-3 text-right">{price(t.entry_price)}</td>
                      <td className="px-4 py-3 text-right text-muted">{price(t.stop_loss)}</td>
                      <td className="px-4 py-3 text-right text-muted">{price(t.take_profit)}</td>
                      <td className="px-4 py-3 text-right">{t.risk_reward ?? '-'}</td>
                      <td className="px-4 py-3 font-sans">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className={`px-4 py-3 text-right ${pnl > 0 ? 'text-buy' : pnl < 0 ? 'text-sell' : 'text-muted'}`}>
                        {money(t.profit)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>
      {trades && trades.length > 0 && (
        <p className="mt-3 text-xs text-muted">
          Showing {shown.length} of {trades.length} trades. Tap a trade to edit or close it.
        </p>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Add trade' : `${editing.side === 'BUY' ? 'Buy' : 'Sell'} ${editing.symbol}`} onClose={close}>
          <TradeForm trade={editing === 'new' ? null : editing} onSaved={onSaved} onDeleted={onDeleted} onCancel={close} />
        </Modal>
      )}
    </AppLayout>
  )
}
