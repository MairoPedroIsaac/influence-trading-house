import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string }

export function FormField({ label, id, ...props }: Props) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-medium text-fg/80">{label}</span>
      <input
        id={id}
        {...props}
        className="h-12 w-full rounded-xl border border-line bg-surface px-4 text-fg outline-none transition-colors placeholder:text-muted/60 hover:border-muted/60 focus:border-fg"
      />
    </label>
  )
}
