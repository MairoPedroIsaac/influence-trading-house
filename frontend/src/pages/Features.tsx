import { Reveal } from '../components/Reveal'
import { CtaBand, PageHero, PublicLayout, Side } from '../components/marketing'

// Example strategies for the "Your strategies" card (not real results).
const STRATEGIES = [
  { name: 'Trend pullback', rate: 62 },
  { name: 'London breakout', rate: 54 },
  { name: 'Range reversal', rate: 41 },
]

export default function Features() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Features"
        title="Prove your edge."
        muted="Then trade it."
        text="Your MT5 trades saved for you, with real stats for every strategy. Plus alerts and EAs for traders who want results they can measure."
        image="/images/features-laptop.webp"
        imageAlt="A laptop showing a dark trading chart"
      />
      <section className="mx-auto max-w-[1240px] px-5 pt-20 sm:px-6">

          <div className="grid gap-4 lg:grid-cols-6">
            <Reveal className="lg:col-span-4">
              <div className="h-full rounded-3xl border border-white/10 bg-[#0c0c0c] p-8 transition-colors hover:border-white/25">
                <p className="text-[13px] font-semibold text-neutral-300">Indicators and EAs</p>
                <h3 className="mt-2.5 max-w-[560px] text-[32px] font-extrabold leading-[1.05] tracking-[-0.035em]">
                  Get the alert, or let the EA take the trade.
                </h3>
                <p className="mt-3.5 max-w-[560px] leading-relaxed text-neutral-400">
                  Your indicator watches MT5 and sends the pair, entry, stop loss, take profit and lot size to your
                  phone. Prefer not to watch at all? Switch on the EA and it trades your rules for you.
                </p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {/* Indicator side */}
                  <div className="rounded-2xl border border-white/10 bg-[#111] p-4">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-neutral-200">Indicator</span>
                      <span className="text-neutral-500">You decide</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black px-3.5 py-2.5">
                        <div>
                          <p className="text-sm font-bold">GBP/USD</p>
                          <p className="tabular font-mono text-[11px] text-neutral-500">Entry 1.26510</p>
                        </div>
                        <Side side="SELL" />
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black px-3.5 py-2.5">
                        <div>
                          <p className="text-sm font-bold">XAU/USD</p>
                          <p className="tabular font-mono text-[11px] text-neutral-500">Entry 2,384.20</p>
                        </div>
                        <Side side="BUY" />
                      </div>
                    </div>
                  </div>
                  {/* EA side */}
                  <div className="rounded-2xl border border-white/10 bg-[#111] p-4">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-neutral-200">Expert Advisor</span>
                      <span className="text-neutral-500">Coming soon</span>
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
              </div>
            </Reveal>

            <Reveal className="lg:col-span-2" delay={100}>
              <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-[#0c0c0c] p-8 transition-colors hover:border-white/25">
                <p className="text-[13px] font-semibold text-neutral-300">Trade journal</p>
                <h3 className="mt-2.5 text-[28px] font-extrabold leading-[1.05] tracking-[-0.035em]">Every trade, written down for you.</h3>
                <p className="mt-2.5 text-[15px] text-neutral-400">Entries, exits and profit in one place. No spreadsheets.</p>
                <div className="tabular mt-5 font-mono text-[13px]">
                  <div className="flex justify-between border-b border-white/10 py-2.5"><span>EUR/USD</span><span className="text-buy">+42.80</span></div>
                  <div className="flex justify-between border-b border-white/10 py-2.5"><span>GBP/JPY</span><span className="text-sell">-18.40</span></div>
                  <div className="flex justify-between border-b border-white/10 py-2.5"><span>XAU/USD</span><span className="text-buy">+96.10</span></div>
                  <div className="flex justify-between border-b border-white/10 py-2.5"><span>USD/JPY</span><span className="text-buy">+54.35</span></div>
                  <div className="flex justify-between py-2.5"><span>NAS100</span><span className="text-sell">-22.60</span></div>
                </div>
                <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/15 pt-5">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.1em] text-neutral-500">This week</p>
                    <p className="tabular mt-1 font-mono text-2xl font-semibold text-buy">+152.25</p>
                  </div>
                  <p className="tabular font-mono text-sm text-neutral-400">3 of 5 won</p>
                </div>
              </div>
            </Reveal>

            <Reveal className="lg:col-span-3">
              <div className="h-full rounded-3xl bg-white p-8 text-black">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13px] font-semibold text-neutral-700">Backtesting</p>
                  <span className="text-[11px] uppercase tracking-[0.1em] text-neutral-500">Coming soon</span>
                </div>
                <h3 className="mt-2.5 text-[28px] font-extrabold leading-[1.05] tracking-[-0.035em]">Know your numbers before you risk money.</h3>
                <p className="mt-2.5 text-[15px] text-neutral-700">Run a strategy on past data and see its win rate, risk to reward and worst losing streak.</p>
                <svg viewBox="0 0 400 120" className="mt-6 block h-auto w-full" aria-hidden="true">
                  <polyline points="0,104 30,98 60,100 90,86 120,90 150,74 180,78 210,60 240,66 270,48 300,52 330,34 360,30 400,14" fill="none" stroke="#050505" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                  <circle cx="394" cy="16" r="5" fill="#16a34a" />
                  <line x1="0" y1="119" x2="400" y2="119" stroke="#e5e5e5" strokeWidth="2" />
                </svg>
              </div>
            </Reveal>

            <Reveal className="lg:col-span-3" delay={100}>
              <div className="group relative isolate h-full scroll-mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c0c] p-8 transition-colors hover:border-white/25">
                <img src="/images/marble-black.webp" alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50 transition-transform duration-[1.2s] ease-out group-hover:scale-105" />
                <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/70 to-[#0c0c0c]/40" />
                <p className="text-[13px] font-semibold text-neutral-300">Your strategies</p>
                <h3 className="mt-2.5 text-[28px] font-extrabold leading-[1.05] tracking-[-0.035em]">Bring your own rules.</h3>
                <p className="mt-2.5 text-[15px] text-neutral-400">Add every strategy you trade. ITH keeps their results apart, so you can see which one really pays.</p>
                <ul className="mt-6 space-y-4 text-[14px]">
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
                <p className="mt-4 text-[12px] text-neutral-500">Example win rates</p>
              </div>
            </Reveal>
          </div>
      </section>
      <CtaBand title="Pass your challenge with data, not luck." text="Create your account and start building your record today." />
    </PublicLayout>
  )
}
