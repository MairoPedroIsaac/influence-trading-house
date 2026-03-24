'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, TrendingUp, BarChart3, Shield, Zap } from 'lucide-react';

const AnimatedCounter: React.FC<{ end: number; suffix: string; prefix?: string; duration?: number }> = ({
  end, suffix, prefix = '', duration = 2000,
}) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    const el = document.getElementById('stats-section');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const Hero: React.FC = () => {
  const stats = [
    { value: 87, suffix: '%', label: 'Win Rate' },
    { value: 24500, suffix: '+', label: 'Signals Delivered' },
    { value: 3200, suffix: '+', label: 'Active Traders' },
    { value: 12, suffix: '%', label: 'Avg Monthly Return' },
  ];

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#D4AF37]/3 rounded-full blur-[100px]" />

      {/* Floating card — live signal */}
      <div className="absolute top-32 right-[15%] hidden lg:block">
        <div className="glass-card rounded-xl p-4 animate-pulse-gold">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono text-white/60">LIVE SIGNAL</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-white">EUR/USD</span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">BUY</span>
          </div>
          <div className="mt-1 text-xs text-white/40 font-mono">Confidence: 94%</div>
        </div>
      </div>

      {/* Floating card — portfolio */}
      <div className="absolute bottom-40 left-[10%] hidden lg:block">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-medium text-white/60">Portfolio +18.4%</span>
          </div>
          <div className="flex gap-1 items-end">
            {[40, 55, 35, 65, 50, 70, 60, 80, 75, 90, 85, 95].map((h, i) => (
              <div key={i} className="w-2 rounded-sm bg-[#D4AF37]/20" style={{ height: `${h * 0.35}px` }}>
                <div className="w-full rounded-sm bg-[#D4AF37]" style={{ height: `40%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-xs font-medium text-[#D4AF37]">Live Trading Signals Active</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Trade Smarter.
            <br />
            <span className="text-gradient-gold">Not Harder.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered trading signals backed by institutional-grade analysis.
            Delivered to your dashboard in real-time.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/register"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#F0D060] text-black font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] text-base"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/signals"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/15 hover:border-[#D4AF37]/30 text-white font-medium px-8 py-4 rounded-xl transition-all duration-300 hover:bg-white/5 text-base"
            >
              <Play className="w-4 h-4" />
              View Live Signals
            </Link>
          </div>

          {/* Trust bar */}
          <div className="flex items-center justify-center gap-6 mb-16 flex-wrap">
            {[
              { icon: Shield, label: '256-bit Encryption' },
              { icon: Zap, label: 'Real-time Delivery' },
              { icon: TrendingUp, label: '5+ Years Track Record' },
            ].map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-2 text-white/30 text-xs">
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div id="stats-section" className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 text-center hover:border-[#D4AF37]/20 transition-all duration-300 group">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1 group-hover:text-[#D4AF37] transition-colors">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-white/40 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A1128] to-transparent" />
    </section>
  );
};

export default Hero;