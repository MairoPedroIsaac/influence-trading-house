import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { AppLayout } from '../layouts/AppLayout'
import { CountUp } from '../components/CountUp'
import { api } from '../lib/api'
import { displayName } from '../lib/user'
import { money, shortDate, type Trade } from '../lib/trades'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function Stat({ label, hint, children, tone }: { label: string; hint: string; children: React.ReactNode; tone?: 'buy' | 'sell' }) {
  const color = tone === 'buy' ? 'text-buy' : tone === 'sell' ? 'text-sell' : 'text-fg'
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className={`mt-3 font-mono text-[32px] font-semibold leading-none tracking-tight ${color}`}>{children}</p>
      <p className="mt-3 text-xs text-muted">{hint}</p>
    </div>
  )
}

const NEXT = [
  { title: 'Backtests', text: 'Run a strategy on past data before you risk money.' },
  { title: 'Alerts and EAs', text: 'Setups sent to your phone, or traded for you by an EA.' },
  { title: 'MT5 sync', text: 'Trades saved to your journal on their own.' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const location = useLocation()
  const isNew = (location.state as { newAccount?: boolean } | null)?.newAccount === true
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

  const list = trades ?? []
  const closed = list.filter((t) => t.status !== 'OPEN')
  const wins = closed.filter((t) => t.status === 'WIN').length
  const open = list.length - closed.length
  const pnl = closed.reduce((sum, t) => sum + Number(t.profit ?? 0), 0)
  const loading = trades === null
  const winRate = closed.length ? Math.round((wins / closed.length) * 100) : null
  const recent = [...list].sort((a, b) => b.opened_at.localeCompare(a.opened_at)).slice(0, 5)
  const dash = <span className="text-muted">-</span>

  return (
    <AppLayout title="Overview">
      {/* Welcome banner */}
      <section className="relative isolate overflow-hidden rounded-3xl bg-black px-6 py-8 text-white sm:px-10 sm:py-10">
        <img src="/images/hero-light-streaks.webp" alt="" aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full object-cover object-bottom opacity-45" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/80 to-black/30" />
        <p className="text-[13px] uppercase tracking-[0.14em] text-neutral-400">
          {isNew ? 'Welcome to Influence Trading House' : greeting()}
        </p>
        <h2 className="font-display-wide mt-3 text-[clamp(1.9rem,4.2vw,3.25rem)] leading-[0.95] tracking-[-0.035em]">
          {displayName(user)}.
        </h2>
        <p className="mt-4 max-w-[520px] leading-relaxed text-neutral-300">
          {list.length === 0 && !loading
            ? 'Your journal is empty. Log your first trade and your numbers will start to build here.'
            : 'Here is how your trading looks right now.'}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/journal" className="inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-bold text-black transition-opacity hover:opacity-90">
            {list.length === 0 ? 'Log your first trade' : 'Open trade journal'}
          </Link>
          {user && !user.first_name && (
            <Link to="/profile" className="inline-flex min-h-11 items-center rounded-full border border-white/25 px-5 text-sm font-medium transition-colors hover:border-white">
              Add your name
            </Link>
          )}
        </div>
      </section>

      {failed && (
        <p role="alert" className="mt-6 rounded-xl border border-sell/40 bg-sell/10 px-4 py-3 text-sm text-sell">
          We could not load your trades. Check your connection and refresh the page.
        </p>
      )}

      {/* Numbers */}
      <section aria-label="Your numbers" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total trades" hint="Everything in your journal">{loading ? dash : <CountUp to={list.length} duration={900} />}</Stat>
        <Stat label="Open trades" hint="Still running">{loading ? dash : <CountUp to={open} duration={900} />}</Stat>
        <Stat label="Win rate" hint={closed.length ? `${wins} of ${closed.length} closed trades won` : 'Shows after your first closed trade'}>
          {loading || winRate === null ? dash : <CountUp to={winRate} suffix="%" duration={900} />}
        </Stat>
        <Stat label="Profit / loss" hint="Closed trades, account currency" tone={closed.length === 0 ? undefined : pnl >= 0 ? 'buy' : 'sell'}>
          {loading || closed.length === 0 ? dash : <CountUp to={pnl} decimals={2} prefix={pnl >= 0 ? '+' : ''} duration={900} />}
        </Stat>
      </section>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        {/* Recent trades */}
        <section className="rounded-2xl border border-line bg-surface">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
            <h2 className="font-bold tracking-[-0.01em]">Recent trades</h2>
            <Link to="/journal" className="text-sm text-muted transition-colors hover:text-fg">
              See all
            </Link>
          </div>
          {loading ? (
            <p className="px-6 py-10 text-center text-sm text-muted">Loading your trades...</p>
          ) : recent.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-medium">No trades yet</p>
              <p className="mt-1 text-sm text-muted">Trades you log will show up here.</p>
            </div>
          ) : (
            <ul>
              {recent.map((t) => (
                <li key={t.id} className="flex items-center gap-4 border-b border-line px-5 py-3.5 last:border-b-0 sm:px-6">
                  <span className={`w-12 shrink-0 rounded-full py-1 text-center text-[11px] font-extrabold ${t.side === 'BUY' ? 'bg-buy text-black' : 'bg-sell text-white'}`}>
                    {t.side}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{t.symbol}</p>
                    <p className="truncate text-xs text-muted">
                      {t.strategy || 'No strategy'} · {shortDate(t.opened_at)}
                    </p>
                  </div>
                  <span
                    className={`tabular shrink-0 font-mono text-sm font-semibold ${
                      t.status === 'OPEN' ? 'text-muted' : Number(t.profit ?? 0) >= 0 ? 'text-buy' : 'text-sell'
                    }`}
                  >
                    {t.status === 'OPEN' ? 'Open' : money(t.profit)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* What is coming */}
        <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="font-bold tracking-[-0.01em]">Coming next</h2>
          <p className="mt-1 text-sm text-muted">What we are building into ITH.</p>
          <ol className="mt-4">
            {NEXT.map((n, i) => (
              <li key={n.title} className="flex gap-4 border-b border-line py-3.5 last:border-b-0">
                <span className="tabular font-mono text-sm text-muted">0{i + 1}</span>
                <div>
                  <p className="font-semibold">{n.title}</p>
                  <p className="mt-0.5 text-sm text-muted">{n.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </AppLayout>
  )
}
