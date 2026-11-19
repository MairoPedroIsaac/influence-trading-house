// Trade journal types and helpers (matches /api/v1/trades/).

export type Side = 'BUY' | 'SELL'
export type Status = 'OPEN' | 'WIN' | 'LOSS' | 'BE'

export type Trade = {
  id: number
  strategy: string
  symbol: string
  side: Side
  lots: string
  entry_price: string
  stop_loss: string
  take_profit: string
  exit_price: string | null
  opened_at: string
  closed_at: string | null
  status: Status
  profit: string | null
  notes: string
  screenshot: string
  source: 'MANUAL' | 'MT5'
  mt5_ticket: number | null
  risk_reward: number | null
}

export const STATUS_LABEL: Record<Status, string> = {
  OPEN: 'Open',
  WIN: 'Win',
  LOSS: 'Loss',
  BE: 'Breakeven',
}

// Prices: drop extra zeros but keep at least the digits that matter.
export function price(v: string | null) {
  if (v === null || v === '') return '-'
  return Number(v).toString()
}

export function money(v: string | null) {
  if (v === null || v === '') return '-'
  const n = Number(v)
  return `${n > 0 ? '+' : ''}${n.toFixed(2)}`
}

export function shortDate(iso: string | null) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// For <input type="datetime-local">: "2026-11-17T12:00" in local time.
export function toLocalInput(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function fromLocalInput(value: string) {
  return value ? new Date(value).toISOString() : null
}
