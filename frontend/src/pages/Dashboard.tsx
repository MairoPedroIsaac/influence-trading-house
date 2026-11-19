import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { AppLayout } from '../layouts/AppLayout'
import { api } from '../lib/api'
import { displayName } from '../lib/user'

type Trade = { id: number; status: string; profit: string | null }

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'buy' | 'sell' }) {
  const color = tone === 'buy' ? 'text-buy' : tone === 'sell' ? 'text-sell' : 'text-fg'
  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-2 font-mono text-2xl ${color}`}>{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const location = useLocation()
  const isNew = (location.state as { newAccount?: boolean } | null)?.newAccount === true
  const [trades, setTrades] = useState<Trade[] | null>(null)

  useEffect(() => {
    api<Trade[]>('/trades/')
      .then(setTrades)
      .catch(() => setTrades([]))
  }, [])

  const list = trades ?? []
  const closed = list.filter((t) => t.status !== 'OPEN')
  const wins = closed.filter((t) => t.status === 'WIN').length
  const open = list.length - closed.length
  const pnl = closed.reduce((sum, t) => sum + Number(t.profit ?? 0), 0)
  const loading = trades === null
  const dash = '-'

  return (
    <AppLayout title="Overview">
      <p className="text-muted">
        {isNew ? 'Welcome to Influence Trading House, ' : 'Welcome back, '}
        <span className="text-fg">{displayName(user)}</span>.
      </p>
      {user && !user.first_name && (
        <p className="mt-2 text-sm text-muted">
          Add your name in{' '}
          <Link to="/profile" className="text-fg underline underline-offset-4">
            Profile
          </Link>{' '}
          so we can greet you properly.
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total trades" value={loading ? dash : String(list.length)} />
        <Stat label="Open trades" value={loading ? dash : String(open)} />
        <Stat label="Win rate" value={loading || closed.length === 0 ? dash : `${Math.round((wins / closed.length) * 100)}%`} />
        <Stat
          label="Profit / loss"
          value={loading || closed.length === 0 ? dash : `${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}`}
          tone={closed.length === 0 ? undefined : pnl >= 0 ? 'buy' : 'sell'}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-surface p-6">
        <div>
          <h2 className="font-medium">Trade journal</h2>
          <p className="mt-1 text-sm text-muted">
            See every trade, add one by hand, or close an open one. Soon MT5 will fill it in automatically.
          </p>
        </div>
        <Link to="/journal" className="rounded-md border border-line px-4 py-2 text-sm hover:border-fg">
          Open journal
        </Link>
      </div>
    </AppLayout>
  )
}
