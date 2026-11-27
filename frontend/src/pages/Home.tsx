import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { LiveChart } from '../components/LiveChart'
import { Reveal } from '../components/Reveal'
import { CountUp } from '../components/CountUp'
import { Arrow, CtaBand, PublicLayout, Side } from '../components/marketing'

// Example prices for the moving ticker strip (not live market data).
const TAPE = [
  { pair: 'EUR/USD', price: '1.08734', chg: '+0.42%', up: true },
  { pair: 'GBP/USD', price: '1.26510', chg: '-0.18%', up: false },
  { pair: 'USD/JPY', price: '159.786', chg: '-0.31%', up: false },
  { pair: 'XAU/USD', price: '2,384.20', chg: '+0.87%', up: true },
  { pair: 'US30', price: '39,214.5', chg: '+0.22%', up: true },
  { pair: 'NAS100', price: '18,402.1', chg: '+0.64%', up: true },
  { pair: 'GBP/JPY', price: '202.118', chg: '-0.09%', up: false },
  { pair: 'AUD/USD', price: '0.66420', chg: '+0.11%', up: true },
]

const EXPLORE = [
  { to: '/features', n: '01', title: 'Features', text: 'Alerts, EAs, a trade journal and backtests. Everything in one place.' },
  { to: '/strategies', n: '02', title: 'Strategies', text: 'Run BTMM and InfluenceX, or bring your own rules.' },
  { to: '/how-it-works', n: '03', title: 'How it works', text: 'Connect MT5 once. Up and running in three steps.' },
]

export default function Home() {
  const { user, loading } = useAuth()

  // Logged-in users go straight to their dashboard.
  if (user) return <Navigate to="/dashboard" replace />
  if (loading) return <div className="min-h-screen bg-black" />

  return (
    <PublicLayout>
        {/* Hero */}
        <div className="relative isolate overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <img src="/images/hero-light-streaks.webp" alt="" className="animate-slow-zoom h-full w-full object-cover object-bottom opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/60 to-[#050505]" />
          </div>
          <section className="mx-auto grid max-w-[1240px] items-center gap-14 px-5 pb-24 pt-14 sm:px-6 md:pt-20 lg:grid-cols-[1fr_1.05fr]">
            <div className="min-w-0">
              <p className="animate-rise inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-[13px] text-neutral-300">
                <span className="animate-pulse-dot h-2 w-2 rounded-full bg-buy" />
                Automatic journal and strategy stats for MT5
              </p>
              <h1 className="font-display-wide mt-7 text-[clamp(2.8rem,5.6vw,4.8rem)] leading-[0.92] tracking-[-0.035em]">
                <span className="animate-rise block [animation-delay:120ms]">Your rules.</span>
                <span className="animate-rise block text-neutral-500 [animation-delay:280ms]">On autopilot.</span>
              </h1>
              <p className="animate-rise mt-7 max-w-[500px] text-lg leading-relaxed text-neutral-300 [animation-delay:420ms]">
                Connect MetaTrader 5 once. Every trade logs itself, and ITH shows you which strategy really makes money.
              </p>
              <div className="animate-rise mt-9 flex flex-wrap gap-3 [animation-delay:540ms]">
                <Link to="/register" className="group inline-flex min-h-[52px] items-center gap-2.5 rounded-full bg-white px-6 font-bold text-black transition-opacity hover:opacity-90">
                  Create your account <Arrow />
                </Link>
                <Link to="/how-it-works" className="inline-flex min-h-[52px] items-center rounded-full border border-white/20 px-6 font-medium transition-colors hover:border-white">
                  See how it works
                </Link>
              </div>
              <ul className="animate-rise mt-10 flex flex-wrap gap-x-6 gap-y-3 text-[13px] text-neutral-400 [animation-delay:640ms]">
                {['Works with MetaTrader 5', 'Sign in with Google', 'Your data stays private'].map((t) => (
                  <li key={t} className="inline-flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4d4d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Live chart with floating alert and result */}
            <div className="relative min-w-0 pb-16">
              <div className="rounded-[18px] border border-white/15 bg-[#0b0b0b] p-2.5 shadow-[0_40px_120px_rgba(34,197,94,0.10)]">
                <div className="overflow-hidden rounded-[10px] border border-white/10 bg-[#0f0f0f]">
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                    <span className="font-mono text-xs text-neutral-300">
                      EUR/USD <span className="text-neutral-500">M15</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2 py-0.5 text-[10px] tracking-[0.08em] text-neutral-300">
                      <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-sell" />
                      LIVE DEMO
                    </span>
                  </div>
                  <div className="px-2 py-2">
                    <LiveChart />
                  </div>
                  <div className="grid grid-cols-3 border-t border-white/10">
                    <div className="border-r border-white/10 px-4 py-3.5">
                      <p className="text-[11px] text-neutral-500">Win rate</p>
                      <p className="tabular mt-1 font-mono text-[clamp(14px,1.6vw,20px)] font-semibold">61%</p>
                    </div>
                    <div className="border-r border-white/10 px-4 py-3.5">
                      <p className="text-[11px] text-neutral-500">Avg R</p>
                      <p className="tabular mt-1 font-mono text-[clamp(14px,1.6vw,20px)] font-semibold">2.1R</p>
                    </div>
                    <div className="px-4 py-3.5">
                      <p className="text-[11px] text-neutral-500">P/L</p>
                      <p className="tabular mt-1 font-mono text-[clamp(14px,1.6vw,20px)] font-semibold text-buy">+$1,284.50</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mx-auto h-2.5 w-[86%] rounded-b-2xl bg-[#1a1a1a]" />

              <div className="animate-float absolute -top-6 right-0 rounded-2xl border border-white/15 bg-[#141414]/85 px-[18px] py-3.5 backdrop-blur sm:-right-2">
                <p className="text-[11px] uppercase tracking-[0.08em] text-neutral-400">Last trade</p>
                <p className="tabular mt-1 font-mono text-3xl font-semibold tracking-tight text-buy">+3.0R</p>
              </div>

              <div className="animate-float-slow absolute bottom-0 left-0 w-[230px] rounded-[30px] border border-white/15 bg-[#0a0a0a] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.7)] sm:-left-4">
                <div className="rounded-[23px] bg-[#121212] px-3.5 pb-3.5 pt-4">
                  <div className="mx-auto mb-3.5 h-1.5 w-16 rounded-full bg-white/10" />
                  <p className="text-[11px] text-neutral-400">Strategy setup found</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[17px] font-bold">EUR/USD</span>
                    <Side side="BUY" />
                  </div>
                  <dl className="tabular mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 font-mono text-xs">
                    <dt className="text-neutral-500">Entry</dt><dd className="text-right">1.08420</dd>
                    <dt className="text-neutral-500">Stop</dt><dd className="text-right text-sell">1.08190</dd>
                    <dt className="text-neutral-500">Target</dt><dd className="text-right text-buy">1.08880</dd>
                    <dt className="text-neutral-500">Lot</dt><dd className="text-right">0.25</dd>
                  </dl>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Ticker strip */}
        <section aria-label="Example market prices" className="overflow-hidden border-y border-white/10 bg-[#080808]">
          <div className="animate-tape flex w-max py-[18px] font-mono text-sm">
            {[...TAPE, ...TAPE].map((t, i) => (
              <span key={i} className="tabular inline-flex items-center gap-2.5 whitespace-nowrap border-r border-white/10 px-7">
                <span className="font-semibold">{t.pair}</span>
                <span className="text-neutral-400">{t.price}</span>
                <span className={t.up ? 'text-buy' : 'text-sell'}>{t.chg}</span>
              </span>
            ))}
          </div>
        </section>

        {/* Numbers strip: each number counts when it scrolls into view */}
        <section aria-label="ITH in numbers" className="border-b border-white/10">
          <div className="mx-auto grid max-w-[1240px] grid-cols-2 md:grid-cols-4">
            <div className="border-b border-r border-white/10 px-5 py-10 sm:px-6 md:border-b-0">
              <p className="font-display-wide text-5xl tracking-[-0.03em]"><CountUp to={5} suffix=" min" /></p>
              <p className="mt-2 text-sm text-neutral-400">To connect your MT5</p>
            </div>
            <div className="border-b border-white/10 px-5 py-10 sm:px-6 md:border-b-0 md:border-r">
              <p className="font-display-wide text-5xl tracking-[-0.03em]"><CountUp to={24} suffix="h" /></p>
              <p className="mt-2 text-sm text-neutral-400">Every trade saved, day and night</p>
            </div>
            <div className="border-r border-white/10 px-5 py-10 sm:px-6">
              <p className="font-display-wide text-5xl tracking-[-0.03em]"><CountUp from={50} to={0} /></p>
              <p className="mt-2 text-sm text-neutral-400">Trades you type by hand</p>
            </div>
            <div className="px-5 py-10 sm:px-6">
              <p className="font-display-wide text-5xl tracking-[-0.03em]"><CountUp to={100} suffix="%" /></p>
              <p className="mt-2 text-sm text-neutral-400">Private. Only you see your trades</p>
            </div>
          </div>
        </section>

        {/* Auto journal */}
        <section className="mx-auto max-w-[1240px] px-5 pt-28 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
            <Reveal>
              <p className="text-[13px] uppercase tracking-[0.14em] text-neutral-400">Automatic journal</p>
              <h2 className="font-display-wide mt-3.5 text-[clamp(2rem,4.4vw,3.75rem)]">Your trades log themselves.</h2>
              <p className="mt-5 max-w-[500px] text-lg leading-relaxed text-neutral-300">
                Add the ITH Reporter to MetaTrader 5 once. From then on, every trade you open or close lands in your journal
                with its entry, stop, target, result and strategy. You never type a price again.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  ['Set up once', 'Paste one private key into MT5. That is all.'],
                  ['Every trade, every pair', 'Manual trades and EA trades, all recorded.'],
                  ['Real numbers, per strategy', 'Win rate, profit and risk to reward from what really happened.'],
                ].map(([t, d]) => (
                  <li key={t} className="flex gap-4">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-buy text-black" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    </span>
                    <span>
                      <span className="block font-bold">{t}</span>
                      <span className="block text-neutral-400">{d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* MT5 to journal picture */}
            <Reveal delay={120}>
              <div aria-hidden="true" className="rounded-3xl border border-white/10 bg-[#0c0c0c] p-5 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black px-5 py-4">
                  <div>
                    <p className="text-xs text-neutral-500">MetaTrader 5 · trade closed</p>
                    <p className="mt-1 flex items-center gap-2 font-bold">
                      EUR/USD <Side side="SELL" />
                    </p>
                  </div>
                  <p className="tabular font-mono text-xl font-semibold text-buy">+502.00</p>
                </div>
                <div className="flex justify-center py-3">
                  <div className="flex flex-col items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-white" style={{ animationDelay: `${i * 0.25}s` }} />
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black">
                  <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-xs text-neutral-500">
                    <span>ITH journal</span>
                    <span className="inline-flex items-center gap-1.5 text-buy">
                      <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-buy" /> Synced
                    </span>
                  </div>
                  <div className="tabular font-mono text-sm">
                    {[
                      ['EUR/USD', 'SELL', '+502.00', true],
                      ['USD/JPY', 'SELL', '+540.35', true],
                      ['XAU/USD', 'BUY', '-120.50', false],
                    ].map(([p, side, pl, up]) => (
                      <div key={p as string} className="flex items-center justify-between border-b border-white/10 px-5 py-3 last:border-b-0">
                        <span className="flex items-center gap-3 font-sans">
                          <Side side={side as 'BUY' | 'SELL'} />
                          <span className="font-semibold">{p}</span>
                        </span>
                        <span className={up ? 'text-buy' : 'text-sell'}>{pl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Explore the other pages */}
        <section className="mx-auto max-w-[1240px] px-5 py-28 sm:px-6">
          <Reveal>
            <p className="text-[13px] uppercase tracking-[0.14em] text-neutral-400">Explore ITH</p>
            <h2 className="font-display-wide mt-3.5 max-w-[820px] text-[clamp(2rem,4.4vw,3.75rem)]">Everything a rule-based trader needs.</h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {EXPLORE.map((e, i) => (
              <Reveal key={e.to} delay={i * 100} className="h-full">
                <Link to={e.to} className="group flex h-full min-h-[240px] flex-col rounded-3xl border border-white/10 bg-[#0c0c0c] p-8 transition duration-300 hover:-translate-y-1 hover:border-white/30">
                  <span className="tabular font-mono text-sm text-neutral-500">{e.n}</span>
                  <h3 className="mt-auto text-[28px] font-extrabold tracking-[-0.035em]">{e.title}</h3>
                  <p className="mt-2 leading-relaxed text-neutral-400">{e.text}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                    Learn more <Arrow />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Founder story */}
        <section className="mx-auto max-w-[1240px] px-5 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <Reveal className="group overflow-hidden rounded-3xl">
              <img src="/images/trader-night.webp" alt="A trader at a laptop late at night with charts on screen" loading="lazy" className="aspect-[4/5] w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105" />
            </Reveal>
            <Reveal delay={120}>
              <p className="text-[13px] uppercase tracking-[0.14em] text-neutral-400">Why ITH exists</p>
              <h2 className="font-display-wide mt-3.5 text-[clamp(2rem,4vw,3.5rem)]">Built by a trader who got tired of missing trades.</h2>
              <p className="mt-6 max-w-[520px] text-lg leading-relaxed text-neutral-300">
                Six years of trading taught me one thing: rules beat feelings. One night a perfect setup came while I was
                asleep. By morning, price had hit my target without me. So I built ITH to watch the charts for me. Now it
                can watch them for you too.
              </p>
              <p className="mt-8 text-sm text-neutral-300">
                Pedro <span className="text-neutral-500">· Founder, trading since 2019</span>
              </p>
            </Reveal>
          </div>
        </section>

      <CtaBand title="Stop watching charts. Start trusting numbers." text="Create your account and start your trade journal today." />
    </PublicLayout>
  )
}
