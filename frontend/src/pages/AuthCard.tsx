import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

// Shared frame for the log in, sign up and password pages.
// Laptop: photo panel on the left, form on the right. Phone: photo banner with the logo, then the form.
export default function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-[#050505] text-white lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel (laptops and wider): real photo with a trade that synced from MT5 */}
      <aside className="relative isolate hidden overflow-hidden border-r border-white/10 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <img src="/images/how-typing.webp" alt="" aria-hidden="true" className="animate-slow-zoom absolute inset-0 -z-10 h-full w-full object-cover object-[40%_center] opacity-60" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-black/80 via-black/40 to-black" />

        <Link to="/" aria-label="Influence Trading House home" className="w-fit">
          <Logo />
        </Link>

        <div>
          <p className="font-display-wide max-w-[520px] text-[clamp(2.2rem,3.6vw,3.6rem)] leading-[0.95] tracking-[-0.035em]">
            <span className="block">Trade it.</span>
            <span className="block">Track it.</span>
            <span className="block text-neutral-400">Trust it.</span>
          </p>
          <p className="mt-5 max-w-[440px] text-lg leading-relaxed text-neutral-200">
            Every MT5 trade saved for you, with real stats for every strategy.
          </p>

          <div className="animate-float-slow mt-10 w-full max-w-[340px] rounded-2xl border border-white/15 bg-black/60 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-[12px] text-neutral-400">
              <span>MetaTrader 5 · trade closed</span>
              <span className="inline-flex items-center gap-1.5 text-buy">
                <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-buy" /> Saved
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="flex items-center gap-2.5 text-[17px] font-bold">
                GBP/USD <span className="rounded-full bg-sell px-2.5 py-0.5 text-[11px] font-extrabold text-white">SELL</span>
              </span>
              <span className="tabular font-mono text-xl font-semibold text-buy">+540.35</span>
            </div>
            <p className="mt-2 text-[12px] text-neutral-400">Added to your journal under BTMM</p>
          </div>
        </div>

        <p className="text-[13px] text-neutral-400">Trading carries risk. Past results do not promise future results.</p>
      </aside>

      {/* Form side */}
      <main className="flex min-w-0 flex-col overflow-x-hidden pb-8 lg:px-10 lg:pt-8">
        {/* Phones: photo banner with the logo */}
        <div className="relative isolate h-44 overflow-hidden lg:hidden">
          <img src="/images/how-typing.webp" alt="" aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full object-cover object-[40%_center] opacity-70" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/30 to-[#050505]" />
          <Link to="/" aria-label="Influence Trading House home" className="absolute left-5 top-6 sm:left-10">
            <Logo size="sm" />
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center px-5 pb-10 pt-2 sm:px-0 lg:py-10">
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
