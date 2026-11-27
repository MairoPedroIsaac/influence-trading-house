import { useState, type InputHTMLAttributes } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: string }

// Password input with a show / hide eye button.
export function PasswordField({ label, id, ...props }: Props) {
  const [show, setShow] = useState(false)

  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-medium text-fg/80">{label}</span>
      <span className="relative block">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          {...props}
          className="peer h-12 w-full rounded-xl border border-line bg-surface pr-12 pl-4 text-fg outline-none transition-colors placeholder:text-muted/60 hover:border-muted/60 focus:border-fg"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted hover:text-fg peer-autofill:text-neutral-500 peer-autofill:hover:text-neutral-900"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </span>
    </label>
  )
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.2 3.2" />
      <path d="M6.6 6.6A17.4 17.4 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="m2 2 20 20" />
    </svg>
  )
}
