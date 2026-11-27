import { useId, useState, type ReactNode } from 'react'

// Smooth accordion. One item open at a time.
// With `split`, laptops show the open item's picture on the right; phones show it inside the open item.

export type AccordionItem = {
  title: ReactNode
  tag?: ReactNode
  content: ReactNode
  visual?: ReactNode
}

function Panel({ open, id, labelledBy, children }: { open: boolean; id: string; labelledBy: string; children: ReactNode }) {
  return (
    <div
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  )
}

export function Accordion({ items, defaultOpen = 0, numbered = true, split = false, compact = false }: { items: AccordionItem[]; defaultOpen?: number | null; numbered?: boolean; split?: boolean; compact?: boolean }) {
  const [open, setOpen] = useState<number | null>(defaultOpen)
  const base = useId()
  const shown = open ?? 0

  const list = (
    <div className="border-t border-white/10">
      {items.map((item, i) => {
        const isOpen = open === i
        const btn = `${base}-b${i}`
        const pnl = `${base}-p${i}`
        return (
          <div key={i} className="relative border-b border-white/10">
            {/* thin white line marks the open item */}
            <span aria-hidden="true" className={`absolute -top-px left-0 h-px bg-white transition-all duration-500 ${isOpen ? 'w-full' : 'w-0'}`} />
            <h3>
              <button
                id={btn}
                type="button"
                aria-expanded={isOpen}
                aria-controls={pnl}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex min-h-[72px] w-full items-center gap-4 py-5 text-left sm:gap-6"
              >
                {numbered && (
                  <span className={`tabular w-7 shrink-0 font-mono text-sm transition-colors ${isOpen ? 'text-white' : 'text-neutral-500'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                )}
                <span className={`min-w-0 flex-1 leading-tight transition-colors ${compact ? 'text-lg font-semibold sm:text-xl' : 'text-[clamp(1.25rem,2.4vw,1.75rem)] font-extrabold tracking-[-0.03em]'} ${isOpen ? 'text-white' : 'text-neutral-400 group-hover:text-white'}`}>
                  {item.title}
                </span>
                {item.tag && <span className="hidden shrink-0 sm:block">{item.tag}</span>}
                <span
                  aria-hidden="true"
                  className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${isOpen ? 'border-white bg-white text-black' : 'border-white/20 text-white group-hover:border-white/60'}`}
                >
                  <span className="absolute h-[1.5px] w-3.5 bg-current" />
                  <span className={`absolute h-3.5 w-[1.5px] bg-current transition-transform duration-300 ${isOpen ? 'scale-y-0' : ''}`} />
                </span>
              </button>
            </h3>
            <Panel open={isOpen} id={pnl} labelledBy={btn}>
              <div className={`pb-7 ${numbered ? 'sm:pl-[52px]' : ''}`}>
                {item.tag && <div className="mb-4 sm:hidden">{item.tag}</div>}
                {item.content}
                {split && item.visual && <div className="mt-6 lg:hidden">{item.visual}</div>}
              </div>
            </Panel>
          </div>
        )
      })}
    </div>
  )

  if (!split) return list

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
      {list}
      <div className="relative hidden lg:sticky lg:top-8 lg:block">
        {items.map((item, i) => (
          <div
            key={i}
            aria-hidden={shown !== i}
            className={`transition-all duration-500 ${shown === i ? 'relative opacity-100' : 'pointer-events-none absolute inset-0 translate-y-3 opacity-0'}`}
          >
            {item.visual}
          </div>
        ))}
      </div>
    </div>
  )
}
