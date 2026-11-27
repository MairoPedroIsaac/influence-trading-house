import { Reveal } from '../components/Reveal'
import { Accordion } from '../components/Accordion'
import { CtaBand, PageHero, PublicLayout, Side } from '../components/marketing'

// Example strategies for the "your own strategies" card (not real results).
const EXAMPLES = [
  { name: 'Trend pullback', rate: 62 },
  { name: 'London breakout', rate: 54 },
  { name: 'Range reversal', rate: 41 },
]

const CARD = 'rounded-3xl border border-white/10 bg-[#0c0c0c] p-6 sm:p-8'
const TEXT = 'max-w-[460px] text-lg leading-relaxed text-neutral-400'

function Status({ children, live }: { children: string; live?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[12px] text-neutral-300">
      <span className={`h-1.5 w-1.5 rounded-full ${live ? 'animate-pulse-dot bg-buy' : 'bg-neutral-500'}`} />
      {children}
    </span>
  )
}

export default function Strategies() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Strategies"
        title="Run ours."
        muted="Or bring your own."
        text="Every strategy gets its own alerts, its own journal and its own numbers, so you always know which one really pays."
        image="/images/strategies-knights.webp"
        imageAlt="A black and a white chess knight facing each other"
      />

      <section className="mx-auto max-w-[1240px] px-5 pt-20 sm:px-6">
        <Reveal>
          <p className="text-[13px] uppercase tracking-[0.14em] text-neutral-400">The strategies</p>
          <h2 className="font-display-wide mt-3.5 max-w-[760px] text-[clamp(1.9rem,3.6vw,3rem)]">Two of ours. Plus yours.</h2>
        </Reveal>
        <Reveal className="mt-10">
          <Accordion
            split
            items={[
              {
                title: 'BTMM',
                tag: <Status live>Indicator live</Status>,
                content: (
                  <>
                    <p className="text-sm text-neutral-500">Beat the Market Makers</p>
                    <p className={`mt-3 ${TEXT}`}>
                      Finds the M and W patterns market makers leave behind. The 4 hour and 1 hour charts set the direction,
                      and entries come on the 15 minute chart.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2"><Status>EA in testing</Status></div>
                  </>
                ),
                visual: (
                  <div className={CARD}>
                    <p className="text-[12px] font-semibold text-neutral-200">BTMM at a glance</p>
                    <dl className="tabular mt-5 grid grid-cols-3 gap-2 font-mono text-sm">
                      {[['Entry chart', 'M15', ''], ['Target', '2R', 'text-buy'], ['Risk', '0.25%', '']].map(([k, v, c]) => (
                        <div key={k} className="rounded-xl border border-white/10 bg-black px-4 py-3">
                          <dt className="font-sans text-[11px] text-neutral-500">{k}</dt>
                          <dd className={`mt-1 ${c}`}>{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-black px-4 py-3">
                      <span className="flex items-center gap-2.5 font-bold">EUR/USD <Side side="SELL" /></span>
                      <span className="tabular font-mono text-buy">+502.00</span>
                    </div>
                  </div>
                ),
              },
              {
                title: 'InfluenceX',
                tag: <Status>In development</Status>,
                content: (
                  <>
                    <p className="text-sm text-neutral-500">Pedro&apos;s own system</p>
                    <p className={`mt-3 ${TEXT}`}>Six years of trading, turned into clear rules. An AI filter is planned to check each setup before you see it.</p>
                    <div className="mt-4 flex flex-wrap gap-2"><Status>AI filter planned</Status></div>
                  </>
                ),
                visual: (
                  <div className={`relative isolate overflow-hidden ${CARD}`}>
                    <img src="/images/marble-black.webp" alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50" />
                    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/75 to-[#0c0c0c]/40" />
                    <p className="text-[12px] font-semibold text-neutral-200">What it looks for</p>
                    <ol className="mt-4 text-[15px]">
                      {['EMA for the trend', 'MACD for momentum', 'Support and resistance', 'Elliott wave structure'].map((item, i) => (
                        <li key={item} className="flex gap-4 border-b border-white/10 py-3 last:border-b-0">
                          <span className="tabular font-mono text-neutral-500">0{i + 1}</span>
                          <span className="text-neutral-200">{item}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ),
              },
              {
                title: 'Your own rules',
                content: (
                  <p className={TEXT}>
                    Name your strategy, tag your trades with it, and ITH keeps its results apart. Compare them side by side and keep the ones that pay.
                  </p>
                ),
                visual: (
                  <div className={CARD}>
                    <p className="text-[12px] font-semibold text-neutral-200">Win rate by strategy</p>
                    <ul className="mt-6 space-y-5 text-[15px]">
                      {EXAMPLES.map((st) => (
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
                ),
              },
            ]}
          />
        </Reveal>
      </section>

      <CtaBand title="Trade like you have a plan." text="Because you do. Create your account and put your rules to work." />
    </PublicLayout>
  )
}
