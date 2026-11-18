import { useState, type ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useToast } from '../toast/useToast'
import { Avatar } from '../components/Avatar'
import { fullName } from '../lib/user'
import { setTheme, useTheme } from '../lib/theme'

// Layout for logged-in pages: sidebar on the left, page on the right.
// On phones the sidebar slides in from a menu button.

type Item = { to: string; label: string; icon: ReactNode; soon?: boolean }

const icon = (d: string) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
)

const MAIN: Item[] = [
  { to: '/dashboard', label: 'Overview', icon: icon('M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8v-6H3v6Zm10-18v6h8V3h-8Z') },
  { to: '/journal', label: 'Trade journal', icon: icon('M4 19.5V5a2 2 0 0 1 2-2h14v16H6.5A2.5 2.5 0 0 0 4 21.5v-2Zm4-12h8M8 11h6'), soon: true },
  { to: '/strategies', label: 'Strategies', icon: icon('M4 20V10M10 20V4M16 20v-8M22 20H2'), soon: true },
  { to: '/backtests', label: 'Backtests', icon: icon('M3 3v18h18M7 15l4-4 3 3 5-6'), soon: true },
  { to: '/alerts', label: 'Alerts', icon: icon('M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0'), soon: true },
]
const ACCOUNT: Item[] = [
  { to: '/profile', label: 'Profile', icon: icon('M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z') },
]

function NavItem({ item, onClick }: { item: Item; onClick: () => void }) {
  if (item.soon) {
    return (
      <span className="flex cursor-default items-center gap-3 rounded-md px-3 py-2 text-sm text-muted/60">
        {item.icon}
        <span className="flex-1">{item.label}</span>
        <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider">Soon</span>
      </span>
    )
  }
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
          isActive ? 'bg-line text-fg' : 'text-muted hover:bg-line/50 hover:text-fg'
        }`
      }
    >
      {item.icon}
      {item.label}
    </NavLink>
  )
}

export function AppLayout({ title, children }: { title: string; children: ReactNode }) {
  const { user, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const theme = useTheme()
  const logo = theme === 'light' ? '/brand/ith-logo-horizontal-black.svg' : '/brand/ith-logo-horizontal-white.svg'
  const close = () => setOpen(false)

  async function onLogout() {
    await logout()
    toast.info('You have logged out.')
    navigate('/login', { replace: true })
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/" className="flex h-16 items-center border-b border-line px-5" onClick={close}>
        <img src={logo} alt="Influence Trading House" className="h-9" />
      </Link>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        <div className="space-y-1">
          <p className="px-3 pb-1 font-mono text-[11px] uppercase tracking-widest text-muted">Trading</p>
          {MAIN.map((item) => (
            <NavItem key={item.to} item={item} onClick={close} />
          ))}
        </div>
        <div className="space-y-1">
          <p className="px-3 pb-1 font-mono text-[11px] uppercase tracking-widest text-muted">Account</p>
          {ACCOUNT.map((item) => (
            <NavItem key={item.to} item={item} onClick={close} />
          ))}
        </div>
      </nav>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar user={user} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-fg">
              {fullName(user)}
            </p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => void onLogout()}
          className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted hover:bg-line/50 hover:text-fg"
        >
          {icon('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9')}
          Log out
        </button>
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen bg-bg text-fg ${theme === 'light' ? 'theme-light' : ''}`}>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-surface lg:block">{sidebar}</aside>

      {/* Phone sidebar */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/60" onClick={close} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-line bg-surface">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-bg/95 px-4 backdrop-blur sm:px-8">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="-ml-1 rounded-md p-2 text-muted hover:text-fg lg:hidden"
          >
            {icon('M3 6h18M3 12h18M3 18h18')}
          </button>
          <h1 className="flex-1 text-lg font-semibold">{title}</h1>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            title={theme === 'light' ? 'Dark theme' : 'Light theme'}
            className="rounded-md border border-line p-2 text-muted hover:text-fg"
          >
            {theme === 'light'
              ? icon('M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z')
              : icon('M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4 7 17M17 7l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z')}
          </button>
        </header>
        <main className="px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  )
}
