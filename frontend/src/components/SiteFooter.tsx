import { Logo } from './Logo'
import { Link } from 'react-router-dom'

// Dark footer for the public pages (home, privacy, terms).
export function SiteFooter() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-white/10 bg-black text-white">
      <img
        src="/images/texture-concrete.webp"
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30"
      />
      <div className="mx-auto max-w-[1240px] px-5 pb-8 pt-16 sm:px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <Logo size="lg" />
            <p className="mt-4 max-w-[320px] text-sm leading-relaxed text-neutral-400">
              An automatic trade journal with real stats for every strategy, built for MetaTrader 5 traders.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 text-sm">
            <p className="mb-1 text-xs uppercase tracking-[0.1em] text-neutral-500">Product</p>
            <Link to="/features" className="text-neutral-300 hover:text-white">Features</Link>
            <Link to="/how-it-works" className="text-neutral-300 hover:text-white">How it works</Link>
            <Link to="/strategies" className="text-neutral-300 hover:text-white">Strategies</Link>
          </div>
          <div className="flex flex-col gap-2.5 text-sm">
            <p className="mb-1 text-xs uppercase tracking-[0.1em] text-neutral-500">Account</p>
            <Link to="/login" className="text-neutral-300 hover:text-white">Log in</Link>
            <Link to="/register" className="text-neutral-300 hover:text-white">Sign up</Link>
          </div>
          <div className="flex flex-col gap-2.5 text-sm">
            <p className="mb-1 text-xs uppercase tracking-[0.1em] text-neutral-500">Legal</p>
            <Link to="/privacy" className="text-neutral-300 hover:text-white">Privacy policy</Link>
            <Link to="/terms" className="text-neutral-300 hover:text-white">Terms of use</Link>
          </div>
        </div>
        <div className="mt-14 flex flex-wrap justify-between gap-4 border-t border-white/10 pt-6 text-[13px] leading-relaxed text-neutral-500">
          <p className="max-w-[640px]">
            Trading carries risk. You can lose money. Past results, including backtests, do not promise future results.
          </p>
          <p>© {new Date().getFullYear()} Influence Trading House</p>
        </div>
      </div>
    </footer>
  )
}
