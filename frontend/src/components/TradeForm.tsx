import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { api, ApiError } from '../lib/api'
import { fromLocalInput, toLocalInput, type Side, type Status, type Trade } from '../lib/trades'
import { Notice } from './Notice'

type Props = {
  trade: Trade | null // null = new trade
  onSaved: (trade: Trade) => void
  onDeleted: (id: number) => void
  onCancel: () => void
}

const inputCls =
  'h-11 w-full rounded-xl border border-line bg-bg px-3.5 text-fg outline-none transition-colors placeholder:text-muted/60 hover:border-muted/60 focus:border-fg'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-fg/80">{label}</span>
      {children}
    </label>
  )
}

// Strategies a trade can belong to. MT5 will fill this in by itself later.
const STRATEGIES = ['BTMM', 'InfluenceX', 'Manual']

// Unsaved "Add trade" form is kept in this browser, so closing it by mistake
// or leaving the page does not lose what was typed.
const DRAFT_KEY = 'ith_trade_draft'

type FormState = ReturnType<typeof emptyForm>

function emptyForm(trade: Trade | null) {
  return {
    symbol: trade?.symbol ?? '',
    side: (trade?.side ?? 'BUY') as Side,
    lots: trade?.lots ?? '',
    entry_price: trade?.entry_price ?? '',
    stop_loss: trade?.stop_loss ?? '',
    take_profit: trade?.take_profit ?? '',
    opened_at: toLocalInput(trade?.opened_at ?? new Date().toISOString()),
    strategy: trade?.strategy ?? 'BTMM',
    status: (trade?.status ?? 'OPEN') as Status,
    exit_price: trade?.exit_price ?? '',
    closed_at: toLocalInput(trade?.closed_at ?? null),
    profit: trade?.profit ?? '',
    notes: trade?.notes ?? '',
  }
}

function readDraft(): FormState | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? (JSON.parse(raw) as FormState) : null
  } catch {
    return null
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // storage blocked: nothing to clear
  }
}

export function TradeForm({ trade, onSaved, onDeleted, onCancel }: Props) {
  const isNew = trade === null
  const [draft] = useState(() => (isNew ? readDraft() : null))
  const [f, setF] = useState<FormState>(() => draft ?? emptyForm(trade))
  const [restored, setRestored] = useState(draft !== null)

  // Save the new-trade form as the user types.
  useEffect(() => {
    if (!isNew) return
    const typed = [f.symbol, f.lots, f.entry_price, f.stop_loss, f.take_profit, f.exit_price, f.profit, f.notes].some(
      (v) => v.trim() !== '',
    )
    try {
      if (typed) localStorage.setItem(DRAFT_KEY, JSON.stringify(f))
      else localStorage.removeItem(DRAFT_KEY)
    } catch {
      // storage blocked: the form still works, just without a draft
    }
  }, [f, isNew])

  function discardDraft() {
    clearDraft()
    setF(emptyForm(null))
    setRestored(false)
  }

  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  // Picking a result fills the exit price for you: Win = take profit,
  // Loss = stop loss, Breakeven = entry. You can still change it.
  function setResult(e: { target: { value: string } }) {
    const status = e.target.value as Status
    const guess = status === 'WIN' ? f.take_profit : status === 'LOSS' ? f.stop_loss : status === 'BE' ? f.entry_price : ''
    setF({ ...f, status, exit_price: f.exit_price || guess })
  }
  const closed = f.status !== 'OPEN'
  const fromMt5 = trade?.source === 'MT5'

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const body = {
      symbol: f.symbol.trim(),
      side: f.side,
      lots: f.lots,
      entry_price: f.entry_price,
      stop_loss: f.stop_loss,
      take_profit: f.take_profit,
      opened_at: fromLocalInput(f.opened_at),
      strategy: f.strategy.trim() || 'BTMM',
      status: f.status,
      exit_price: closed && f.exit_price !== '' ? f.exit_price : null,
      closed_at: closed ? fromLocalInput(f.closed_at) ?? new Date().toISOString() : null,
      profit: closed && f.profit !== '' ? f.profit : null,
      notes: f.notes,
    }
    try {
      const saved = trade
        ? await api<Trade>(`/trades/${trade.id}/`, { method: 'PATCH', body: JSON.stringify(body) })
        : await api<Trade>('/trades/', { method: 'POST', body: JSON.stringify(body) })
      if (isNew) clearDraft()
      onSaved(saved)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save. Try again.')
    } finally {
      setBusy(false)
    }
  }

  async function onDelete() {
    if (!trade || !window.confirm('Delete this trade? This cannot be undone.')) return
    setBusy(true)
    try {
      await api(`/trades/${trade.id}/`, { method: 'DELETE' })
      onDeleted(trade.id)
    } catch {
      setError('Could not delete. Try again.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {fromMt5 && <p className="text-sm text-muted">This trade came from MT5 automatically. You can still add notes or change the strategy.</p>}
      {restored && (
        <p className="text-sm text-muted">
          We kept what you typed last time.{' '}
          <button type="button" onClick={discardDraft} className="text-fg underline underline-offset-4">
            Start over
          </button>
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Symbol">
          <input className={`${inputCls} uppercase`} placeholder="EURUSD" required value={f.symbol} onChange={set('symbol')} />
        </Field>
        <Field label="Side">
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-line p-1">
            {(['BUY', 'SELL'] as Side[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setF({ ...f, side: s })}
                className={`rounded py-1.5 text-sm font-medium ${
                  f.side === s ? (s === 'BUY' ? 'bg-buy text-white' : 'bg-sell text-white') : 'text-muted hover:text-fg'
                }`}
              >
                {s === 'BUY' ? 'Buy' : 'Sell'}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Lots">
          <input className={`${inputCls} font-mono`} inputMode="decimal" placeholder="0.10" required value={f.lots} onChange={set('lots')} />
        </Field>
        <Field label="Entry">
          <input className={`${inputCls} font-mono`} inputMode="decimal" required value={f.entry_price} onChange={set('entry_price')} />
        </Field>
        <Field label="Stop loss">
          <input className={`${inputCls} font-mono`} inputMode="decimal" required value={f.stop_loss} onChange={set('stop_loss')} />
        </Field>
        <Field label="Take profit">
          <input className={`${inputCls} font-mono`} inputMode="decimal" required value={f.take_profit} onChange={set('take_profit')} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Opened">
          <input type="datetime-local" className={inputCls} required value={f.opened_at} onChange={set('opened_at')} />
        </Field>
        <Field label="Strategy">
          <select className={inputCls} value={f.strategy} onChange={set('strategy')}>
            {[...new Set([...STRATEGIES, f.strategy])].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Result">
        <select className={inputCls} value={f.status} onChange={setResult}>
          <option value="OPEN">Open</option>
          <option value="WIN">Win</option>
          <option value="LOSS">Loss</option>
          <option value="BE">Breakeven</option>
        </select>
      </Field>

      {closed && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Exit price">
            <input className={`${inputCls} font-mono`} inputMode="decimal" value={f.exit_price} onChange={set('exit_price')} />
          </Field>
          <Field label="Profit / loss">
            <input className={`${inputCls} font-mono`} inputMode="decimal" placeholder="-25.00" value={f.profit} onChange={set('profit')} />
          </Field>
        </div>
      )}

      <Field label="Notes">
        <textarea className={`${inputCls} min-h-20`} placeholder="Why you took it, what you learned" value={f.notes} onChange={set('notes')} />
      </Field>

      {error && <Notice kind="error">{error}</Notice>}

      <div className="flex flex-wrap items-center gap-2 pt-2">
        <button type="submit" disabled={busy} className="rounded-full bg-fg px-5 py-2.5 text-sm font-bold text-bg hover:opacity-90 disabled:opacity-50">
          {busy ? 'Saving...' : trade ? 'Save changes' : 'Add trade'}
        </button>
        <button
          type="button"
          onClick={() => {
            if (isNew) clearDraft()
            onCancel()
          }}
          className="rounded-full border border-line px-5 py-2.5 text-sm text-muted hover:text-fg"
        >
          Cancel
        </button>
        {trade && (
          <button type="button" onClick={() => void onDelete()} disabled={busy} className="ml-auto text-sm text-sell hover:underline disabled:opacity-50">
            Delete trade
          </button>
        )}
      </div>
    </form>
  )
}
