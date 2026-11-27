import { Reveal } from '../components/Reveal'
import { Accordion } from '../components/Accordion'
import { CtaBand, PageHero, PublicLayout, Side } from '../components/marketing'

// Example data for the pictures (not real results).
const STRATEGIES = [
  { name: 'Trend pullback', rate: 62 },
  { name: 'London breakout', rate: 54 },
  { name: 'Range reversal', rate: 41 },
]
const JOURNAL: [string, string, boolean][] = [
  ['EUR/USD', '+42.80', true],
  ['GBP/JPY', '-18.40', false],
  ['XAU/USD', '+96.10', true],
  ['USD/JPY', '+54.35', true],
  ['NAS100', '-22.60', false],
]

const CARD = 'rounded-3xl border border-white/10 bg-[#0c0c0c] p-6 sm:p-8'

function JournalPicture() {
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between gap-3 text-[12px] text-neutral-400">
        <span className="font-semibold text-neutral-200">Your journal</span>
        <span className="inline-flex items-center gap-1.5 text-buy">
          <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-buy" /> Synced from MT5
        </span>
      </div>
      <div className="tabular mt-4 font-mono text-[13px]">
        {JOURNAL.map(([p, pl, up]) => (
          <div key={p} className="flex justify-between border-b border-white/10 py-2.5 last:border-b-0">
            <span>{p}</span>
            <span className={up ? 'text-buy' : 'text-sell'}>{pl}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/15 pt-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-neutral-500">This week</p>
          <p className="tabular mt-1 font-mono text-2xl font-semibold text-buy">+152.25</p>
        </div>
        <p className="tabular font-mono text-sm text-neutral-400">3 of 5 won</p>
      </div>
    </div>
  )
}

function StatsPicture() {
  return (
    <div className={`relative isolate overflow-hidden ${CARD}`}>
      <img src="/images/marble-black.webp" alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/70 to-[#0c0c0c]/40" />
      <p className="text-[12px] font-semibold text-neutral-200">Win rate by strategy</p>
      <ul className="mt-6 space-y-5 text-[14px]">
        {STRATEGIES.map((st) => (
          <li key={st.name}>
            <div className="flex items-center justify-between">
              <span className="text-neutral-200">{st.name}</span>
              <span className="tabular font-mono text-neutral-400">{st.rate}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className={`h-full rounded-full ${st.rate >= 50 ? 'bg-buy' : 'bg-sell'}`} style={{ width: `${st.rate}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-[12px] text-neutral-500">Example win rates</p>
    </div>
  )
}

function AlertsPicture() {
  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${CARD}`}>
      <div>
        <div className="flex items-center justify-between text-[12px]">
          <span className="font-semibold text-neutral-200">Indicator</span>
          <span className="text-neutral-500">You decide</span>
        </div>
        <div className="mt-3 space-y-2">
          {[
            ['GBP/USD', 'Entry 1.26510', 'SELL'],
            ['XAU/USD', 'Entry 2,384.20', 'BUY'],
          ].map(([p, e, side]) => (
            <div key={p} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black px-3.5 py-2.5">
              <div>
                <p className="text-sm font-bold">{p}</p>
                <p className="tabular font-mono text-[11px] text-neutral-500">{e}</p>
              </div>
              <Side side={side as 'BUY' | 'SELL'} />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between text-[12px]">
          <span className="font-semibold text-neutral-200">Expert Advisor</span>
          <span className="text-neutral-500">In testing</span>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-black px-3.5 py-3">
          <div>
            <p className="text-sm font-bold">Auto-trading</p>
            <p className="text-[11px] text-neutral-500">Follows your rules and risk limits</p>
          </div>
          <span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-buy">
            <span className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white" />
          </span>
        </div>
        <dl className="tabular mt-2 grid grid-cols-2 gap-2 font-mono text-[12px]">
          <div className="rounded-xl border border-white/10 bg-black px-3.5 py-2.5">
            <dt className="font-sans text-[11px] text-neutral-500">Risk per trade</dt>
            <dd className="mt-0.5 text-neutral-200">1.0%</dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-black px-3.5 py-2.5">
            <dt className="font-sans text-[11px] text-neutral-500">Daily loss limit</dt>
            <dd className="mt-0.5 text-neutral-200">3.0%</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

const TEXT = 'max-w-[460px] text-lg leading-relaxed text-neutral-400'

export default function Features() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Features"
        title="Prove your edge."
        muted="Then trade it."
        text="Your MT5 trades saved for you, with real stats for every strategy. Plus alerts and EAs for traders who want results they can measure."
        image="/images/features-chart-poster.webp"
        video="/videos/features-chart.mp4"
        imageAlt="Green and red candles moving on a trading screen"
      />

      <section className="mx-auto max-w-[1240px] px-5 pt-20 sm:px-6">
        <Reveal>
          <p className="text-[13px] uppercase tracking-[0.14em] text-neutral-400">What you get</p>
          <h2 className="font-display-wide mt-3.5 max-w-[760px] text-[clamp(1.9rem,3.6vw,3rem)]">Three tools. One account.</h2>
        </Reveal>
        <Reveal className="mt-10">
          <Accordion
            split
            items={[
              {
                title: 'Automatic trade journal',
                content: <p className={TEXT}>Connect MT5 once. Every trade you open or close is saved with its entry, exit, profit and strategy. No spreadsheets, no typing.</p>,
                visual: <JournalPicture />,
              },
              {
                title: 'Stats for every strategy',
                content: <p className={TEXT}>Tag each trade with a strategy. ITH keeps their results apart, so you can see which one really pays and drop the ones that do not.</p>,
                visual: <StatsPicture />,
              },
              {
                title: 'Alerts and EAs',
                tag: <span className="rounded-full border border-white/15 px-3 py-1 text-[12px] text-neutral-300">In testing</span>,
                content: <p className={TEXT}>Your indicator sends the pair, entry, stop loss, take profit and lot size to your phone. Prefer not to watch at all? Switch on the EA and it trades your rules for you.</p>,
                visual: <AlertsPicture />,
              },
            ]}
          />
        </Reveal>
      </section>

      <CtaBand title="Pass your challenge with data, not luck." text="Create your account and start building your record today." />
    </PublicLayout>
  )
}
