import { Reveal } from '../components/Reveal'
import { Accordion } from '../components/Accordion'
import { CtaBand, PageHero, PublicLayout, Side } from '../components/marketing'

const FAQ = [
  { q: 'Is ITH a broker?', a: 'No. ITH never holds your money. Your trades run on your own MT5 account with your own broker.' },
  { q: 'Do I need MetaTrader 5?', a: 'Yes, for the automatic journal, alerts and EAs. You can also add trades by hand.' },
  { q: 'Will the EA trade with real money?', a: 'Only if you switch it on. We strongly suggest running it on a demo account first, and every EA has a risk limit per trade.' },
  { q: 'Can other people see my trades?', a: 'No. Your journal, strategies and results are private to your account.' },
  { q: 'Does ITH promise profits?', a: 'No. ITH helps you test and follow your rules. Trading carries risk, and past results, including backtests, do not promise future results.' },
]

const TEXT = 'max-w-[460px] text-lg leading-relaxed text-neutral-400'

export default function HowItWorks() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="How it works"
        title="Three steps."
        muted="No guessing."
        text="Connect MT5 once. After that, every trade is saved for you, and your numbers update by themselves."
        image="/images/how-trader-poster.webp"
        video="/videos/how-trader.mp4"
        imageAlt="A trader typing with charts open on two laptops"
      />
      <section className="mx-auto max-w-[1240px] px-5 pt-20 sm:px-6">
        <Reveal>
          <p className="text-[13px] uppercase tracking-[0.14em] text-neutral-400">The steps</p>
          <h2 className="font-display-wide mt-3.5 max-w-[760px] text-[clamp(1.9rem,3.6vw,3rem)]">Set up once. Then just trade.</h2>
        </Reveal>
        <Reveal className="mt-10">
          <Accordion
            split
            items={[
              {
                title: 'Connect MetaTrader 5',
                content: <p className={TEXT}>Make your private key in ITH, then add the ITH Reporter to one MT5 chart. It takes about five minutes, and you only do it once.</p>,
                visual: (
                  <div className="flex h-60 items-center justify-center rounded-3xl border border-white/10 bg-[#0c0c0c] px-6 sm:h-72">
                    <div className="flex items-center gap-3 rounded-full border border-white/15 bg-black px-5 py-3 text-sm">
                      <span className="animate-pulse-dot h-2 w-2 rounded-full bg-buy" />
                      <span className="font-medium">MT5 connected</span>
                      <span className="tabular font-mono text-xs text-neutral-500">Sent: 2 Failed: 0</span>
                    </div>
                  </div>
                ),
              },
              {
                title: 'Trade as usual',
                content: <p className={TEXT}>Trade by hand, from an alert, or let an EA trade for you. Every trade you open or close is saved to your journal by itself.</p>,
                visual: (
                  <div className="flex h-60 items-center justify-center rounded-3xl border border-white/10 bg-[#0c0c0c] px-6 sm:h-72">
                    <div className="w-full max-w-[300px] rounded-2xl border border-white/15 bg-black px-4 py-3.5">
                      <div className="flex items-center justify-between text-[11px] text-neutral-500">
                        <span>MT5 · trade closed</span>
                        <span className="text-buy">Saved</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="flex items-center gap-2.5 font-bold">XAU/USD <Side side="BUY" /></span>
                        <span className="tabular font-mono text-buy">+96.10</span>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                title: 'Review your results',
                content: <p className={TEXT}>See your win rate, profit and risk to reward for each strategy, so you know what to keep and what to drop.</p>,
                visual: (
                  <div className="flex h-60 items-center justify-center rounded-3xl border border-white/10 bg-[#0c0c0c] px-6 sm:h-72 items-end gap-2 pb-8 pt-10" aria-hidden="true">
                    {[40, 64, 30, 78, 52, 88, 24, 70].map((h, i) => (
                      <span key={i} className={`w-full max-w-6 rounded-t ${[2, 6].includes(i) ? 'bg-sell' : 'bg-buy'}`} style={{ height: `${h}%` }} />
                    ))}
                  </div>
                ),
              },
            ]}
          />
        </Reveal>
      </section>

      <section className="mx-auto max-w-[860px] px-5 pt-28 sm:px-6">
        <Reveal>
          <p className="text-[13px] uppercase tracking-[0.14em] text-neutral-400">Questions</p>
          <h2 className="font-display-wide mt-3.5 text-[clamp(1.9rem,3.6vw,3rem)]">Good to know.</h2>
        </Reveal>
        <Reveal className="mt-10">
          <Accordion
            numbered={false}
            compact
            defaultOpen={null}
            items={FAQ.map((f) => ({ title: f.q, content: <p className="max-w-[680px] text-lg leading-relaxed text-neutral-400">{f.a}</p> }))}
          />
        </Reveal>
      </section>

      <CtaBand title="Stop watching charts. Start trusting numbers." text="Set up takes minutes. Your first trade in the journal takes seconds." />
    </PublicLayout>
  )
}
