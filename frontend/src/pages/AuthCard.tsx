import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

// Shared frame for the log in, sign up and password pages.
// Laptop: brand panel on the left, form on the right. Phone: logo, then the form.
export default function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-[#050505] text-white lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel (laptops and wider) */}
      <aside className="relative isolate hidden overflow-hidden border-r border-white/10 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <img src="/images/hero-light-streaks.webp" alt="" aria-hidden="true" className="animate-slow-zoom absolute inset-0 -z-10 h-full w-full object-cover object-bottom opacity-50" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-black via-black/70 to-black/90" />

        <Link to="/" aria-label="Influence Trading House home" className="w-fit">
          <img src="/brand/ith-logo-horizontal-white.svg" alt="Influence Trading House" className="h-10 w-auto" />
        </Link>

        <div>
          <p className="font-display-wide max-w-[520px] text-[clamp(2.2rem,3.6vw,3.6rem)] leading-[0.95] tracking-[-0.035em]">
            <span className="block">Test it.</span>
            <span className="block">Track it.</span>
            <span className="block text-neutral-500">Trust it.</span>
          </p>
          <p className="mt-5 max-w-[440px] text-lg leading-relaxed text-neutral-300">
            Your strategy, your alerts and every trade you take, in one private account.
          </p>

          {/* Small product preview */}
          <div className="mt-10 flex flex-wrap items-end gap-4">
            <div className="animate-float-slow w-[240px] rounded-[28px] border border-white/15 bg-[#0a0a0a] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
              <div className="rounded-[21px] bg-[#121212] px-4 pb-4 pt-4">
                <p className="text-[11px] text-neutral-400">Strategy setup found</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[17px] font-bold">GBP/USD</span>
                  <span className="rounded-full bg-sell px-3 py-1 text-xs font-extrabold text-white">SELL</span>
                </div>
                <dl className="tabular mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 font-mono text-xs">
                  <dt className="text-neutral-500">Entry</dt><dd className="text-right">1.26510</dd>
                  <dt className="text-neutral-500">Stop</dt><dd className="text-right text-sell">1.26780</dd>
                  <dt className="text-neutral-500">Target</dt><dd className="text-right text-buy">1.25970</dd>
                </dl>
              </div>
            </div>
            <div className="animate-float rounded-2xl border border-white/15 bg-[#141414]/85 px-5 py-4 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.08em] text-neutral-400">Win rate</p>
              <p className="tabular mt-1 font-mono text-3xl font-semibold text-buy">61%</p>
            </div>
          </div>
        </div>

        <p className="text-[13px] text-neutral-500">Trading carries risk. Past results do not promise future results.</p>
      </aside>

      {/* Form side */}
      <main className="flex flex-col px-5 py-8 sm:px-10">
        <Link to="/" aria-label="Influence Trading House home" className="w-fit lg:hidden">
          <img src="/brand/ith-logo-horizontal-white.svg" alt="Influence Trading House" className="h-9 w-auto" />
        </Link>
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10">
          <h1 className="text-[clamp(1.9rem,3vw,2.4rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">{title}</h1>
          {subtitle && <p className="mt-3 leading-relaxed text-neutral-400">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
        <p className="text-center text-[13px] text-neutral-500">
          <Link to="/privacy" className="hover:text-white">Privacy policy</Link>
          <span className="mx-2">·</span>
          <Link to="/terms" className="hover:text-white">Terms of use</Link>
        </p>
      </main>
    </div>
  )
}
