import React from 'react';
import Link from 'next/link';
import { BookOpen, Play, Clock, BarChart3, TrendingUp, Brain } from 'lucide-react';

const courses = [
  { title: 'Understanding the 13-Point Confluence System', category: 'Strategy', duration: '45 min', level: 'Intermediate', icon: TrendingUp, description: 'Learn how to identify high-probability setups using our proprietary scoring system.' },
  { title: 'Market Regime Detection Masterclass', category: 'Analysis', duration: '60 min', level: 'Advanced', icon: BarChart3, description: 'Understand trending, ranging, and volatile market conditions using ADX and ATR.' },
  { title: 'Risk Management for Consistent Profits', category: 'Risk', duration: '30 min', level: 'Beginner', icon: BookOpen, description: 'Position sizing, stop placement, and the mathematics of long-term profitability.' },
  { title: 'Introduction to ML Signal Scoring', category: 'Technology', duration: '50 min', level: 'Advanced', icon: Brain, description: 'How our machine learning models generate and validate trading signals.' },
  { title: 'Reading the Backtesting Reports', category: 'Analytics', duration: '25 min', level: 'Beginner', icon: BarChart3, description: 'Interpret Sharpe ratios, drawdown charts, and win rate statistics.' },
  { title: 'Elliott Wave Theory in Practice', category: 'Strategy', duration: '55 min', level: 'Intermediate', icon: TrendingUp, description: 'Apply wave theory as one component of your confluence scoring.' },
];

const levelColors: Record<string, string> = {
  Beginner: 'text-emerald-400 bg-emerald-400/10',
  Intermediate: 'text-[#D4AF37] bg-[#D4AF37]/10',
  Advanced: 'text-orange-400 bg-orange-400/10',
};

export default function EducationPage() {
  return (
    <div className="min-h-screen bg-[#0A1128] text-white">
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 mb-6">
            <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-xs font-medium text-[#D4AF37]">Trading Education</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Learn to Trade <span className="text-gradient-gold">Like a Professional</span>
          </h1>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            Institutional-grade education covering everything from signal interpretation to advanced quant strategies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 hover:border-[#D4AF37]/20 transition-all duration-300 group cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors">
                  <course.icon className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${levelColors[course.level]}`}>
                  {course.level}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-[#D4AF37] transition-colors leading-snug">
                {course.title}
              </h3>
              <p className="text-xs text-white/40 leading-relaxed mb-4">{course.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-white/30">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
                  <span>{course.category}</span>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-medium text-[#D4AF37] hover:text-[#F0D060] transition-colors">
                  <Play className="w-3 h-3" /> Start
                </button>
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