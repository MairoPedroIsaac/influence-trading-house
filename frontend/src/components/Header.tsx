import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function Header() {
  const { user } = useAuth()

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" aria-label="Influence Trading House home">
          <img src="/brand/ith-logo-horizontal-white.svg" alt="Influence Trading House" className="h-11" />
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link to="/dashboard" className="rounded-md bg-fg px-3 py-2 font-medium text-bg hover:opacity-90">
                Go to dashboard
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-muted hover:text-fg">
                Log in
              </Link>
              <Link to="/register" className="rounded-md bg-fg px-3 py-2 font-medium text-bg hover:opacity-90">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
