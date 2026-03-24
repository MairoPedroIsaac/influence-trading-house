import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Filter, RefreshCw } from 'lucide-react';

const signals = [
  { pair: 'EUR/USD', type: 'Forex', direction: 'BUY', confidence: 94, score: 11, entry: '1.0875', tp: '1.0920', sl: '1.0850', timeframe: '4H', regime: 'TRENDING' },
  { pair: 'BTC/USD', type: 'Crypto', direction: 'SELL', confidence: 78, score: 9, entry: '63,400', tp: '61,200', sl: '64,800', timeframe: '1D', regime: 'VOLATILE' },
  { pair: 'GBP/JPY', type: 'Forex', direction: 'BUY', confidence: 88, score: 10, entry: '193.20', tp: '195.40', sl: '192.80', timeframe: '1H', regime: 'TRENDING' },
  { pair: 'GOLD', type: 'Commodity', direction: 'BUY', confidence: 82, score: 9, entry: '2,318', tp: '2,380', sl: '2,290', timeframe: '4H', regime: 'TRENDING' },
  { pair: 'S&P 500', type: 'Index', direction: 'SELL', confidence: 71, score: 8, entry: '5,240', tp: '5,100', sl: '5,310', timeframe: '1D', regime: 'RANGING' },
  { pair: 'ETH/USD', type: 'Crypto', direction: 'BUY', confidence: 85, score: 10, entry: '3,120', tp: '3,400', sl: '2,980', timeframe: '4H', regime: 'TRENDING' },
];

export default function SignalsPage() {
  return (
    <div className="min-h-screen bg-[#0A1128] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Live Signals</h1>
            <p className="text-white/40 mt-1">AI-generated signals updated in real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 glass-card rounded-xl text-sm text-white/60 hover:text-white transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#D4AF37] rounded-xl text-sm font-semibold text-black hover:bg-[#F0D060] transition-colors">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {signals.map((s, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 hover:border-[#D4AF37]/20 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{s.pair}</h3>
                  <span className="text-xs text-white/40">{s.type} · {s.timeframe}</span>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full ${
                  s.direction === 'BUY' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'
                }`}>
                  {s.direction === 'BUY' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {s.direction}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-white/40">Confidence</span>
                  <span className="text-xs font-mono text-[#D4AF37]">{s.confidence}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: `${s.confidence}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {[{ label: 'Entry', value: s.entry, color: 'text-white' }, { label: 'Take Profit', value: s.tp, color: 'text-emerald-400' }, { label: 'Stop Loss', value: s.sl, color: 'text-red-400' }].map((item, j) => (
                  <div key={j} className="bg-white/5 rounded-lg p-2.5 text-center">
                    <div className="text-[10px] text-white/30 mb-1">{item.label}</div>
                    <div className={`text-xs font-mono font-semibold ${item.color}`}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#D4AF37]">Score: {s.score}/13</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  s.regime === 'TRENDING' ? 'bg-emerald-400/10 text-emerald-400' :
                  s.regime === 'VOLATILE' ? 'bg-orange-400/10 text-orange-400' :
                  'bg-white/10 text-white/40'
                }`}>{s.regime}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-[#D4AF37] hover:text-[#F0D060] transition-colors">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}