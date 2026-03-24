import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Activity, BarChart3, Bell, Settings, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';

const signals = [
  { pair: 'EUR/USD', direction: 'BUY', confidence: 94, score: 11, tp: '1.0920', sl: '1.0850', status: 'ACTIVE' },
  { pair: 'BTC/USD', direction: 'SELL', confidence: 78, score: 9, tp: '61,200', sl: '64,800', status: 'ACTIVE' },
  { pair: 'GBP/JPY', direction: 'BUY', confidence: 88, score: 10, tp: '195.40', sl: '192.80', status: 'PENDING' },
  { pair: 'GOLD', direction: 'BUY', confidence: 82, score: 9, tp: '2,380', sl: '2,290', status: 'ACTIVE' },
];

const stats = [
  { label: 'Win Rate', value: '87%', change: '+2.3%', up: true, icon: TrendingUp },
  { label: 'Active Signals', value: '4', change: 'Live now', up: true, icon: Zap },
  { label: 'Monthly Return', value: '+18.4%', change: '+4.1% vs last month', up: true, icon: BarChart3 },
  { label: 'Drawdown', value: '3.2%', change: '-0.8% vs last month', up: false, icon: Activity },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0A1128] text-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-[#080e1f] border-r border-white/5 flex flex-col z-40">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-tight text-white leading-none">INFLUENCE</span>
              <span className="text-[9px] font-medium tracking-[0.2em] text-[#D4AF37] uppercase leading-none mt-0.5">Trading House</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { label: 'Dashboard', href: '/dashboard', active: true },
            { label: 'Live Signals', href: '/signals' },
            { label: 'Backtest', href: '/backtest' },
            { label: 'Education', href: '/education' },
            { label: 'Settings', href: '/settings' },
          ].map((item) => (
            <Link key={item.label} href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                item.active ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="glass-card rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
              <span className="text-xs font-bold text-[#D4AF37]">MP</span>
            </div>
            <div>
              <p className="text-xs font-medium text-white">Mairo Pedro</p>
              <p className="text-[10px] text-[#D4AF37]">Pro Plan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-white/40 mt-1">Welcome back. Here's your trading overview.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Bell className="w-4 h-4 text-white/60" />
            </button>
            <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Settings className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40 font-medium">{stat.label}</span>
                <stat.icon className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className={`flex items-center gap-1 text-xs ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Signals Table */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Live Signals</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-white/40">4 active</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Pair', 'Direction', 'Confidence', 'Score', 'Take Profit', 'Stop Loss', 'Status'].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-white/30 pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {signals.map((s, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 pr-4 text-sm font-semibold text-white">{s.pair}</td>
                    <td className="py-4 pr-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        s.direction === 'BUY' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'
                      }`}>
                        {s.direction === 'BUY' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {s.direction}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: `${s.confidence}%` }} />
                        </div>
                        <span className="text-xs text-white/60">{s.confidence}%</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-sm text-[#D4AF37] font-mono">{s.score}/13</td>
                    <td className="py-4 pr-4 text-sm font-mono text-emerald-400">{s.tp}</td>
                    <td className="py-4 pr-4 text-sm font-mono text-red-400">{s.sl}</td>
                    <td className="py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        s.status === 'ACTIVE' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-[#D4AF37]/10 text-[#D4AF37]'
                      }`}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}