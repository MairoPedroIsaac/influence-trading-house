import { Logo } from './Logo'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

const PAGES = [
  { to: '/', label: 'Home' },
  { to: '/features', label: 'Features' },
  { to: '/strategies', label: 'Strategies' },
  { to: '/how-it-works', label: 'How it works' },
]

// Laptop menu: the page you are on is white with a green dot under it; the rest are grey.
const navClass = ({ isActive }: { isActive: boolean }) =>
  `relative py-2 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-buy after:transition-opacity ${
    isActive ? 'font-semibold text-white after:opacity-100' : 'text-neutral-400 after:opacity-0'
  }`

// Phone menu: the page you are on gets a lit-up row and a green dot. The other rows are grey with an arrow to go there.
const phoneClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-14 items-center gap-3 rounded-2xl px-4 text-lg font-semibold transition-colors ${
    isActive ? 'bg-white/[0.08] text-white' : 'text-neutral-500 hover:text-white'
  }`

export function Header() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="relative z-40 border-b border-white/10 bg-[#050505]/80 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between gap-4 px-5 sm:px-6">
        <Link to="/" aria-label="Influence Trading House home" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 text-sm md:flex">
          {PAGES.map((p) => (
            <NavLink key={p.to} to={p.to} end className={navClass}>
              {p.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 text-sm">
          {user ? (
            <Link to="/dashboard" className="rounded-full bg-white px-[18px] py-3 font-semibold text-black transition-opacity hover:opacity-90">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden px-3 py-3 text-neutral-300 transition-colors hover:text-white sm:block">
                Log in
              </Link>
              <Link to="/register" className="rounded-full bg-white px-[18px] py-3 font-semibold text-black transition-opacity hover:opacity-90">
                Sign up
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="ml-1 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 md:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Phone menu */}
      {open && (
        <nav aria-label="Main" className="animate-rise absolute inset-x-0 top-full space-y-1 border-b border-white/10 bg-[#050505] px-3 pb-5 pt-3 [animation-duration:300ms] md:hidden">
          {PAGES.map((p) => (
            <NavLink key={p.to} to={p.to} end onClick={() => setOpen(false)} className={phoneClass}>
              {({ isActive }) => (
                <>
                  <span className={`h-2 w-2 shrink-0 rounded-full ${isActive ? 'bg-buy' : 'bg-white/15'}`} aria-hidden="true" />
                  <span className="flex-1">{p.label}</span>
                  {!isActive && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-neutral-600">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  )}
                </>
              )}
            </NavLink>
          ))}
          {!user && (
            <NavLink to="/login" onClick={() => setOpen(false)} className={phoneClass}>
              <span className="h-2 w-2 shrink-0 rounded-full bg-white/15" aria-hidden="true" />
              <span className="flex-1">Log in</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-neutral-600">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </NavLink>
          )}
        </nav>
      )}
    </header>
  )
}
