import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Header } from './Header'
import { SiteFooter } from './SiteFooter'
import { Reveal } from './Reveal'

// Shared pieces for the public pages (home, features, strategies, how it works).

export function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform group-hover:translate-x-1">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function Side({ side }: { side: 'BUY' | 'SELL' }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${side === 'BUY' ? 'bg-buy text-black' : 'bg-sell text-white'}`}>
      {side}
    </span>
  )
}

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050505] text-white antialiased">
      <Header />
      <main>{children}</main>
      <SiteFooter />
    </div>
  )
}

// Big title block at the top of an inner page: text on the left, a photo on the right.
export function PageHero({ eyebrow, title, muted, text, image, imageAlt, imagePos = 'center', video }: { eyebrow: string; title: string; muted: string; text: string; image?: string; imageAlt?: string; imagePos?: string; video?: string }) {
  const calm = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  return (
    <div className="relative isolate overflow-hidden border-b border-white/10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <img src="/images/hero-light-streaks.webp" alt="" className="animate-slow-zoom h-full w-full object-cover object-bottom opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/60 to-[#050505]" />
      </div>
      <section className="mx-auto grid max-w-[1240px] items-center gap-10 px-5 pb-16 pt-12 sm:px-6 md:pb-20 md:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div className="min-w-0">
          <p className="animate-rise text-[13px] uppercase tracking-[0.14em] text-neutral-400">{eyebrow}</p>
          <h1 className="font-display-wide mt-4 text-[clamp(2.4rem,5.4vw,4.6rem)]">
            <span className="animate-rise block [animation-delay:120ms]">{title}</span>
            <span className="animate-rise block text-neutral-500 [animation-delay:260ms]">{muted}</span>
          </h1>
          <p className="animate-rise mt-6 max-w-[520px] text-lg leading-relaxed text-neutral-300 [animation-delay:400ms]">{text}</p>
        </div>
        {image && (
          <div className="animate-rise group relative overflow-hidden rounded-3xl border border-white/10 [animation-delay:300ms]">
            {video && !calm ? (
              <video src={video} poster={image} autoPlay muted loop playsInline preload="metadata" aria-label={imageAlt} className="aspect-video w-full object-cover" style={{ objectPosition: imagePos }} />
            ) : (
              <img src={image} alt={imageAlt ?? ''} className={`${video ? 'aspect-video' : 'aspect-[4/3] lg:aspect-[5/4]'} w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105`} style={{ objectPosition: imagePos }} />
            )}
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
        )}
      </section>
    </div>
  )
}

// Closing call to action on the city-at-night photo.
export function CtaBand({ title, text }: { title: string; text: string }) {
  return (
    <section className="px-5 py-24 sm:px-6">
      <Reveal className="mx-auto max-w-[1240px]">
        <div className="relative isolate overflow-hidden rounded-[32px] border border-white/10 px-[clamp(1.5rem,6vw,5rem)] py-[clamp(3rem,8vw,6rem)]">
          <img src="/images/city-night.webp" alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_70%]" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/80 to-black/30" />
          <h2 className="font-display-wide max-w-[760px] text-[clamp(2.1rem,5vw,4.25rem)]">{title}</h2>
          <p className="mt-5 max-w-[520px] text-lg leading-relaxed text-neutral-300">{text}</p>
          <Link to="/register" className="group mt-9 inline-flex min-h-14 items-center gap-2.5 rounded-full bg-white px-7 text-[17px] font-bold text-black transition-opacity hover:opacity-90">
            Create your account <Arrow />
          </Link>
        </div>
      </Reveal>
    </section>
  )
}
