import { useEffect, useRef, useState } from 'react'

// A number that counts from `from` to `to` the first time it scrolls into view.
// People who turn on "reduce motion" see the final number straight away.
export function CountUp({
  to,
  from = 0,
  duration = 1400,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: {
  to: number
  from?: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [value, setValue] = useState(reduced ? to : from)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced) return
    let frame = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration)
          const eased = 1 - Math.pow(1 - t, 3)
          setValue(from + (to - from) * eased)
          if (t < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [to, from, duration, reduced])

  const shown = value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

  return (
    <span ref={ref} className={`tabular ${className}`}>
      <span aria-hidden="true">
        {prefix}
        {shown}
        {suffix}
      </span>
      <span className="sr-only">
        {prefix}
        {to.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
        {suffix}
      </span>
    </span>
  )
}
