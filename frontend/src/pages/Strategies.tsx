import { Reveal } from '../components/Reveal'
import { CtaBand, PageHero, PublicLayout } from '../components/marketing'

// Example strategies for the "your own strategies" card (not real results).
const EXAMPLES = [
  { name: 'Trend pullback', rate: 62 },
  { name: 'London breakout', rate: 54 },
  { name: 'Range reversal', rate: 41 },
]

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
          <p className="text-[13px] uppercase tracking-[0.14em] text-neutral-400">ITH strategies</p>
          <h2 className="font-display-wide mt-3.5 max-w-[760px] text-[clamp(1.9rem,3.6vw,3rem)]">Built and tested by traders who use them.</h2>
        </Reveal>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {/* BTMM */}
          <Reveal className="h-full">
            <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-[#0c0c0c] p-8 transition-colors hover:border-white/25">
              <div className="flex flex-wrap gap-2">
                <Status live>Indicator live</Status>
                <Status>EA in testing</Status>
              </div>
              <h3 className="mt-6 text-[34px] font-extrabold leading-none tracking-[-0.04em]">BTMM</h3>
              <p className="mt-1 text-sm text-neutral-500">Beat the Market Makers</p>
              <p className="mt-5 leading-relaxed text-neutral-400">
                Finds the M and W patterns market makers leave behind. The 4 hour and 1 hour charts set the direction,
                and entries come on the 15 minute chart.
              </p>
              <dl className="tabular mt-auto grid grid-cols-3 gap-2 pt-8 font-mono text-sm">
                <div className="rounded-xl border border-white/10 bg-black px-4 py-3">
                  <dt className="font-sans text-[11px] text-neutral-500">Entry chart</dt>
                  <dd className="mt-1">M15</dd>
                </div>
                <div className="rounded-xl border border-white/10 bg-black px-4 py-3">
                  <dt className="font-sans text-[11px] text-neutral-500">Target</dt>
                  <dd className="mt-1 text-buy">2R</dd>
                </div>
                <div className="rounded-xl border border-white/10 bg-black px-4 py-3">
                  <dt className="font-sans text-[11px] text-neutral-500">Risk</dt>
                  <dd className="mt-1">0.25%</dd>
                </div>
              </dl>
            </article>
          </Reveal>

          {/* InfluenceX */}
          <Reveal className="h-full" delay={100}>
            <article className="group relative isolate flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c0c] p-8 transition-colors hover:border-white/25">
              <img src="/images/marble-black.webp" alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50 transition-transform duration-[1.2s] ease-out group-hover:scale-105" />
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/75 to-[#0c0c0c]/40" />
              <div className="flex flex-wrap gap-2">
                <Status>Indicator in development</Status>
                <Status>AI filter planned</Status>
              </div>
              <h3 className="mt-6 text-[34px] font-extrabold leading-none tracking-[-0.04em]">InfluenceX</h3>
              <p className="mt-1 text-sm text-neutral-500">Pedro&apos;s own system</p>
              <p className="mt-5 leading-relaxed text-neutral-400">
                Six years of trading, turned into clear rules. An AI filter is planned to check each setup before you see it.
              </p>
              <ol className="mt-auto pt-6 text-[15px]">
                {['EMA for the trend', 'MACD for momentum', 'Support and resistance', 'Elliott wave structure'].map((item, i) => (
                  <li key={item} className="flex gap-4 border-b border-white/10 py-2.5 last:border-b-0">
                    <span className="tabular font-mono text-neutral-500">0{i + 1}</span>
                    <span className="text-neutral-200">{item}</span>
                  </li>
                ))}
              </ol>
            </article>
          </Reveal>
        </div>
      </section>

      {/* Your own strategies */}
      <section className="mx-auto max-w-[1240px] px-5 pt-28 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="text-[13px] uppercase tracking-[0.14em] text-neutral-400">Your strategies</p>
            <h2 className="font-display-wide mt-3.5 text-[clamp(1.9rem,3.6vw,3rem)]">Have your own rules? Add them.</h2>
            <p className="mt-5 max-w-[500px] text-lg leading-relaxed text-neutral-300">
              Name your strategy, tag your trades with it, and ITH keeps its results apart. Compare them side by side
              and keep the ones that pay.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <div className="rounded-3xl border border-white/10 bg-[#0c0c0c] p-8">
              <ul className="space-y-5 text-[15px]">
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
          </Reveal>
        </div>
      </section>

      <CtaBand title="Trade like you have a plan." text="Because you do. Create your account and put your rules to work." />
    </PublicLayout>
  )
}
