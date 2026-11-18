import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string }

export function FormField({ label, id, ...props }: Props) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      <input
        id={id}
        {...props}
        className="w-full rounded-md border border-line bg-bg px-3 py-2.5 text-fg outline-none placeholder:text-muted/60 focus:border-fg"
      />
    </label>
  )
}
