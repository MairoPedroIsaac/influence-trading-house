// ITH logo: the candle crown mark plus the name, set in the site font (Geist).
// "TRADING HOUSE" is spread so it is exactly as wide as "INFLUENCE".

const SMALL = 'TRADING HOUSE'.split('')

export function Logo({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const fs = size === 'sm' ? 'text-[16px]' : size === 'lg' ? 'text-[22px]' : 'text-[19px]'
  return (
    <span className={`inline-flex items-center gap-[0.55em] text-white ${fs} ${className}`} role="img" aria-label="Influence Trading House">
      <img src="/brand/ith-mark-white.svg" alt="" aria-hidden="true" className="h-[2.05em] w-auto" />
      <span aria-hidden="true" className="inline-flex flex-col leading-none">
        <span className="-mr-[0.07em] font-extrabold tracking-[0.07em]">INFLUENCE</span>
        <span className="mt-[0.32em] flex justify-between text-[0.47em] font-semibold text-neutral-300">
          {SMALL.map((c, i) => (c === ' ' ? <span key={i} className="w-[0.5em]" /> : <span key={i}>{c}</span>))}
        </span>
      </span>
    </span>
  )
}
