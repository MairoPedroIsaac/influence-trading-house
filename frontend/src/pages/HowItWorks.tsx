import { Reveal } from '../components/Reveal'
import { CtaBand, PageHero, PublicLayout, Side } from '../components/marketing'

const FAQ = [
  { q: 'Is ITH a broker?', a: 'No. ITH never holds your money. Your trades run on your own MT5 account with your own broker.' },
  { q: 'Do I need MetaTrader 5?', a: 'For alerts and EAs, yes. The trade journal works on its own, so you can also log trades by hand.' },
  { q: 'Will the EA trade with real money?', a: 'Only if you switch it on. We strongly suggest running it on a demo account first, and every EA has a risk limit per trade.' },
  { q: 'Can other people see my trades?', a: 'No. Your journal, strategies and results are private to your account.' },
  { q: 'Does ITH promise profits?', a: 'No. ITH helps you test and follow your rules. Trading carries risk, and past results, including backtests, do not promise future results.' },
]

export default function HowItWorks() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="How it works"
        title="Three steps."
        muted="No guessing."
        text="Connect MT5 once. After that, every trade is saved for you, and your numbers update by themselves."
        image="/images/how-typing.webp"
        imageAlt="Hands typing on a laptop in a dark room"
        imagePos="40% center"
      />
      <section className="mx-auto max-w-[1240px] px-5 pt-20 sm:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Reveal className="h-full">
              <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-[#0c0c0c] p-7 transition duration-300 hover:-translate-y-1 hover:border-white/25">
                <div className="flex h-36 items-center justify-center rounded-2xl border border-white/10 bg-[#111]">
                  <div className="flex items-center gap-3 rounded-full border border-white/15 bg-black px-4 py-2.5 text-sm">
                    <span className="animate-pulse-dot h-2 w-2 rounded-full bg-buy" />
                    <span className="font-medium">MT5 connected</span>
                    <span className="tabular font-mono text-xs text-neutral-500">EURUSD M15</span>
                  </div>
                </div>
                <p className="tabular mt-6 font-mono text-sm text-neutral-500">01</p>
                <h3 className="mt-2 text-[22px] font-bold tracking-[-0.02em]">Connect MetaTrader 5</h3>
                <p className="mt-2 leading-relaxed text-neutral-400">Add the ITH indicator to your MT5 charts. It takes a few minutes.</p>
              </div>
            </Reveal>
            <Reveal className="h-full" delay={100}>
              <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-[#0c0c0c] p-7 transition duration-300 hover:-translate-y-1 hover:border-white/25">
                <div className="flex h-36 items-center justify-center rounded-2xl border border-white/10 bg-[#111] px-4">
                  <div className="w-full max-w-[250px] rounded-2xl border border-white/15 bg-black px-4 py-3">
                    <div className="flex items-center justify-between text-[11px] text-neutral-500">
                      <span>ITH alert</span>
                      <span>now</span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="font-bold">XAU/USD</span>
                      <Side side="BUY" />
                    </div>
                    <p className="tabular mt-1 font-mono text-[11px] text-neutral-400">Entry 2,384.20 · SL 2,371.50</p>
                  </div>
                </div>
                <p className="tabular mt-6 font-mono text-sm text-neutral-500">02</p>
                <h3 className="mt-2 text-[22px] font-bold tracking-[-0.02em]">Get the alert, or let the EA trade</h3>
                <p className="mt-2 leading-relaxed text-neutral-400">Nothing happens until every rule of your strategy is met.</p>
              </div>
            </Reveal>
            <Reveal className="h-full" delay={200}>
              <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-[#0c0c0c] p-7 transition duration-300 hover:-translate-y-1 hover:border-white/25">
                <div className="flex h-36 items-end justify-center gap-2 rounded-2xl border border-white/10 bg-[#111] px-6 pb-6 pt-8" aria-hidden="true">
                  {[40, 64, 30, 78, 52, 88, 24, 70].map((h, i) => (
                    <span key={i} className={`w-full max-w-5 rounded-t ${[2, 6].includes(i) ? 'bg-sell' : 'bg-buy'}`} style={{ height: `${h}%` }} />
                  ))}
                </div>
                <p className="tabular mt-6 font-mono text-sm text-neutral-500">03</p>
                <h3 className="mt-2 text-[22px] font-bold tracking-[-0.02em]">Review your results</h3>
                <p className="mt-2 leading-relaxed text-neutral-400">Every trade is saved with its result, so you can see what to keep and what to drop.</p>
              </div>
            </Reveal>
          </div>
      </section>

      <section className="mx-auto max-w-[860px] px-5 pt-28 sm:px-6">
        <Reveal>
          <p className="text-[13px] uppercase tracking-[0.14em] text-neutral-400">Questions</p>
          <h2 className="font-display-wide mt-3.5 text-[clamp(1.9rem,3.6vw,3rem)]">Good to know.</h2>
        </Reveal>
        <div className="mt-10 border-t border-white/10">
          {FAQ.map((f) => (
            <details key={f.q} className="group border-b border-white/10">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-neutral-400 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="max-w-[680px] pb-6 leading-relaxed text-neutral-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <CtaBand title="Stop watching charts. Start trusting numbers." text="Set up takes minutes. Your first trade in the journal takes seconds." />
    </PublicLayout>
  )
}
