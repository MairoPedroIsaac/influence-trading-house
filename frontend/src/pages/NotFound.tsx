import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg text-fg">
      <p className="font-mono text-muted">404</p>
      <h1 className="mt-2 text-xl font-semibold">Page not found</h1>
      <Link to="/" className="mt-6 underline underline-offset-4">
        Back to home
      </Link>
    </div>
  )
}
