import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

// Shared frame for the login and sign up pages.
export default function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 py-12 text-fg">
      <Link to="/" aria-label="Influence Trading House home">
        <img src="/brand/ith-logo-stacked-white.svg" alt="Influence Trading House" className="h-28" />
      </Link>
      <div className="mt-8 w-full max-w-sm rounded-lg border border-line bg-surface p-6">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
