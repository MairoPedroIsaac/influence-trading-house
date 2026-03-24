'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

const results = [
  { metric: 'Total Return', value: '+127.4%', positive: true },
  { metric: 'Win Rate', value: '84.2%', positive: true },
  { metric: 'Profit Factor', value: '2.87', positive: true },
  { metric: 'Max Drawdown', value: '-8.3%', positive: false },
  { metric: 'Sharpe Ratio', value: '2.14', positive: true },
  { metric: 'Total Trades', value: '342', positive: true },
];

export default function BacktestPage() {
  const [asset, setAsset] = useState('EUR/USD');
  const [period, setPeriod] = useState('12M');
  const [minScore, setMinScore] = useState(8);
  const [ran, setRan] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A1128] text-white">
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 mb-6">
            <BarChart3 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-xs font-medium text-[#D4AF37]">Strategy Backtesting</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Validate Your <span className="text-gradient-gold">Edge</span>
          </h1>
          <p className="text-white/40 max-w-xl mx-auto">Test the ITH signal system against historical data before trading live.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-6">Configuration</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs text-white/40 mb-2">Asset</label>
                <select value={asset} onChange={(e) => setAsset(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/40">
                  {['EUR/USD', 'BTC/USD', 'GBP/JPY', 'GOLD', 'S&P 500'].map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-2">Period</label>
                <div className="grid grid-cols-3 gap-2">
                  {['3M', '6M', '12M', '2Y', '3Y', '5Y'].map(p => (
                    <button key={p} onClick={() => setPeriod(p)}
                      className={`py-2 rounded-lg text-xs font-medium transition-all ${period === p ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-2">Min Score: {minScore}/13</label>
                <input type="range" min={6} max={13} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="w-full" />
              </div>
              <button onClick={() => setRan(true)}
                className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#F0D060] text-black font-semibold py-3 rounded-xl transition-all">
                <Play className="w-4 h-4" /> Run Backtest
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-5">
            {ran ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {results.map((r, i) => (
                    <div key={i} className="glass-card rounded-xl p-4">
                      <div className="text-xs text-white/40 mb-1">{r.metric}</div>
                      <div className={`text-xl font-bold ${r.positive ? 'text-emerald-400' : 'text-red-400'}`}>{r.value}</div>
                    </div>
                  ))}
                </div>
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-white mb-4">Equity Curve</h3>
                  <div className="h-48 flex items-end gap-1">
                    {[30,35,32,40,38,45,43,50,48,55,60,58,65,70,68,75,72,80,85,90,88,95,92,100].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-[#D4AF37]/30 to-[#D4AF37]" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-white/20 mt-2">
                    <span>Start</span><span>{period} ago</span><span>Now</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center h-full">
                <BarChart3 className="w-12 h-12 text-white/10 mb-4" />
                <p className="text-white/30 text-sm">Configure your parameters and run the backtest to see results.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-[#D4AF37] hover:text-[#F0D060] transition-colors">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}