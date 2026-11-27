import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

const PAGES = [
  { to: '/', label: 'Home' },
  { to: '/features', label: 'Features' },
  { to: '/strategies', label: 'Strategies' },
  { to: '/how-it-works', label: 'How it works' },
]

const navClass = ({ isActive }: { isActive: boolean }) => `transition-colors hover:text-white ${isActive ? 'text-white' : 'text-neutral-400'}`

export function Header() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="relative z-40 border-b border-white/10 bg-[#050505]/80 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between gap-4 px-5 sm:px-6">
        <Link to="/" aria-label="Influence Trading House home" className="shrink-0">
          <img src="/brand/ith-logo-horizontal-white.svg" alt="Influence Trading House" className="h-9 w-auto sm:h-10" />
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
        <nav aria-label="Main" className="absolute inset-x-0 top-full border-b border-white/10 bg-[#050505] px-5 pb-6 pt-2 md:hidden">
          {PAGES.map((p) => (
            <NavLink key={p.to} to={p.to} end onClick={() => setOpen(false)} className={({ isActive }) => `block border-b border-white/10 py-4 text-lg font-semibold ${isActive ? 'text-white' : 'text-neutral-300'}`}>
              {p.label}
            </NavLink>
          ))}
          {!user && (
            <Link to="/login" onClick={() => setOpen(false)} className="block py-4 text-lg font-semibold text-neutral-300">
              Log in
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
