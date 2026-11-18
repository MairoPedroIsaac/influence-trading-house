import { useEffect, useState } from 'react'

// Animated demo candlestick chart for the home page hero.
// Made-up prices (random walk), not real market data.

type Candle = { o: number; h: number; l: number; c: number }

const COUNT = 48 // candles on screen
const TICKS_PER_CANDLE = 6 // price updates before a new candle starts
const TICK_MS = 250
const W = 640
const H = 380
const PAD = { top: 20, right: 72, bottom: 20, left: 8 }

function step(price: number) {
  return Math.max(1.05, price + (Math.random() - 0.495) * 0.0006)
}

function newCandle(open: number): Candle {
  return { o: open, h: open, l: open, c: open }
}

function tick(c: Candle): Candle {
  const next = step(c.c)
  return { ...c, c: next, h: Math.max(c.h, next), l: Math.min(c.l, next) }
}

function initialCandles(): Candle[] {
  const list: Candle[] = []
  let price = 1.1
  for (let i = 0; i < COUNT; i++) {
    let c = newCandle(price)
    for (let t = 0; t < TICKS_PER_CANDLE; t++) c = tick(c)
    list.push(c)
    price = c.c
  }
  return list
}

function ema(values: number[], period: number) {
  const k = 2 / (period + 1)
  const out: number[] = []
  values.forEach((v, i) => out.push(i === 0 ? v : v * k + out[i - 1] * (1 - k)))
  return out
}

export function LiveChart() {
  const [candles, setCandles] = useState<Candle[]>(initialCandles)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let count = 0
    const id = window.setInterval(() => {
      count++
      setCandles((prev) => {
        const last = prev[prev.length - 1]
        if (count % TICKS_PER_CANDLE === 0) {
          return [...prev.slice(1), newCandle(last.c)]
        }
        return [...prev.slice(0, -1), tick(last)]
      })
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [])

  const highs = candles.map((c) => c.h)
  const lows = candles.map((c) => c.l)
  const max = Math.max(...highs)
  const min = Math.min(...lows)
  const range = max - min || 0.001
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom
  const slot = plotW / COUNT
  const bodyW = slot * 0.6
  const y = (p: number) => PAD.top + ((max - p) / range) * plotH
  const x = (i: number) => PAD.left + i * slot + slot / 2

  const line = ema(
    candles.map((c) => c.c),
    9,
  )
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(' ')

  const last = candles[candles.length - 1]
  const lastUp = last.c >= last.o
  const grid = [0.2, 0.4, 0.6, 0.8]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Animated example price chart">
      {grid.map((g) => (
        <line key={g} x1={PAD.left} x2={W - PAD.right} y1={PAD.top + g * plotH} y2={PAD.top + g * plotH} stroke="#222" strokeDasharray="2 4" />
      ))}

      {candles.map((c, i) => {
        const up = c.c >= c.o
        const color = up ? '#16a34a' : '#dc2626'
        const top = y(Math.max(c.o, c.c))
        const bottom = y(Math.min(c.o, c.c))
        return (
          <g key={i}>
            <line x1={x(i)} x2={x(i)} y1={y(c.h)} y2={y(c.l)} stroke={color} strokeWidth={1} />
            <rect x={x(i) - bodyW / 2} y={top} width={bodyW} height={Math.max(1, bottom - top)} fill={color} />
          </g>
        )
      })}

      <path d={line} fill="none" stroke="#ededed" strokeWidth={1.25} strokeOpacity={0.7} />

      {/* live price line and label */}
      <line x1={PAD.left} x2={W - PAD.right} y1={y(last.c)} y2={y(last.c)} stroke={lastUp ? '#16a34a' : '#dc2626'} strokeDasharray="3 3" strokeOpacity={0.8} />
      <rect x={W - PAD.right + 4} y={y(last.c) - 10} width={PAD.right - 6} height={20} rx={3} fill={lastUp ? '#16a34a' : '#dc2626'} />
      <text x={W - PAD.right + 8} y={y(last.c) + 4} fill="#0a0a0a" fontSize={11} fontFamily="JetBrains Mono, monospace" fontWeight={500}>
        {last.c.toFixed(5)}
      </text>
    </svg>
  )
}
