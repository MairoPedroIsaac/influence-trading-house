import { Link, Navigate } from 'react-router-dom'
import { Header } from '../components/Header'
import { useAuth } from '../auth/useAuth'
import { LiveChart } from '../components/LiveChart'

const features = [
  {
    title: 'Strategy alerts',
    text: 'MT5 indicators watch the charts and send the setup to your phone with entry, stop loss, take profit and lot size.',
  },
  {
    title: 'Trade journal',
    text: 'Every trade is recorded automatically from MT5. No typing prices by hand.',
  },
  {
    title: 'Backtesting and stats',
    text: 'See win rate, risk to reward and results per strategy, so you know what actually works.',
  },
]

export default function Home() {
  const { user, loading } = useAuth()

  // Logged-in users go straight to their dashboard.
  if (user) return <Navigate to="/dashboard" replace />
  if (loading) return <div className="min-h-screen bg-bg" />

  return (
    <div className="min-h-screen bg-bg text-fg">
      <Header />

      <main className="mx-auto max-w-6xl px-6">
        <section className="grid items-center gap-12 py-20 md:py-28 lg:grid-cols-2">
          <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Backtesting and analytics for traders
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl xl:text-6xl">
            Trade your rules, not your feelings.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Influence Trading House turns your strategy into MT5 alerts, records every trade, and shows you
            the numbers behind your results.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to={user ? '/dashboard' : '/register'}
              className="rounded-md bg-fg px-5 py-3 font-medium text-bg hover:opacity-90"
            >
              {user ? 'Go to dashboard' : 'Create an account'}
            </Link>
            {!user && (
              <Link to="/login" className="rounded-md border border-line px-5 py-3 hover:border-fg">
                Log in
              </Link>
            )}
          </div>
          </div>

          <div className="rounded-lg border border-line bg-surface p-4">
            <p className="mb-3 font-mono text-xs text-muted">EUR/USD  M15</p>
            <LiveChart />
          </div>
        </section>

        <section className="grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="bg-surface p-6">
              <h2 className="font-medium">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mx-auto mt-24 max-w-6xl border-t border-line px-6 py-8 text-sm text-muted">
        Influence Trading House. Trading involves risk. Past results do not guarantee future results.
      </footer>
    </div>
  )
}
