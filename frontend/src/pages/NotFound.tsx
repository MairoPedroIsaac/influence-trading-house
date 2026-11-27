import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] px-5 text-center text-white">
      <p className="font-display-wide text-[clamp(5rem,20vw,10rem)] leading-none tracking-[-0.04em] text-neutral-800">404</p>
      <h1 className="mt-4 text-2xl font-extrabold tracking-[-0.02em]">This page does not exist.</h1>
      <p className="mt-2 text-neutral-400">The link may be old or mistyped.</p>
      <Link to="/" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-white px-6 font-bold text-black transition-opacity hover:opacity-90">
        Back to home
      </Link>
    </div>
  )
}
