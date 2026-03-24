'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowRight, Twitter, Linkedin, Github, Youtube } from 'lucide-react';

const columns = [
  { title: 'Platform', links: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Live Signals', href: '/signals' }, { label: 'Backtesting', href: '/backtest' }, { label: 'Education', href: '/education' }, { label: 'API Docs', href: '#' }] },
  { title: 'Company', links: [{ label: 'About Us', href: '#' }, { label: 'Careers', href: '#' }, { label: 'Blog', href: '#' }, { label: 'Press Kit', href: '#' }, { label: 'Contact', href: '#' }] },
  { title: 'Resources', links: [{ label: 'Documentation', href: '#' }, { label: 'Trading Guides', href: '/education' }, { label: 'Market Analysis', href: '#' }, { label: 'Community', href: '#' }, { label: 'Status Page', href: '#' }] },
  { title: 'Legal', links: [{ label: 'Privacy Policy', href: '#' }, { label: 'Terms of Service', href: '#' }, { label: 'Risk Disclosure', href: '#' }, { label: 'Cookie Policy', href: '#' }, { label: 'Compliance', href: '#' }] },
];

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(''); setTimeout(() => setSubscribed(false), 3000); }
  };

  return (
    <footer className="relative border-t border-white/5">
      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="glass-card rounded-3xl p-8 lg:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent" />
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Ready to Trade with <span className="text-gradient-gold">Confidence?</span>
            </h3>
            <p className="text-white/40 max-w-xl mx-auto mb-8">
              Join 3,200+ traders already using AI-powered signals to make smarter decisions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#F0D060] text-black font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/education" className="inline-flex items-center gap-2 border border-white/15 hover:border-white/30 text-white font-medium px-8 py-4 rounded-xl transition-all">
                View Live Results
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#D4AF37] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-black" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-white leading-none">INFLUENCE</span>
                <span className="text-[10px] font-medium tracking-[0.2em] text-[#D4AF37] uppercase leading-none mt-0.5">Trading House</span>
              </div>
            </Link>
            <p className="text-sm text-white/30 max-w-xs mb-6">
              AI-powered trading signals for the modern trader. Institutional-grade analysis, delivered in real-time.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/40 transition-colors" />
              <button type="submit" className="bg-[#D4AF37] hover:bg-[#F0D060] text-black font-medium px-4 py-2.5 rounded-lg transition-all text-sm flex-shrink-0">
                {subscribed ? 'Done!' : 'Subscribe'}
              </button>
            </form>
          </div>
          {columns.map((col, i) => (
            <div key={i}>
              <h4 className="text-sm font-semibold text-white mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link, li) => (
                  <li key={li}>
                    <Link href={link.href} className="text-sm text-white/30 hover:text-white/70 transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-white/20">&copy; {new Date().getFullYear()} Influence Trading House. All rights reserved.</div>
          <div className="flex items-center gap-4">
            {[Twitter, Linkedin, Github, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#D4AF37]/10 transition-colors">
                <Icon className="w-3.5 h-3.5 text-white/40" />
              </a>
            ))}
          </div>
          <div className="text-xs text-white/20">Trading involves risk. Past performance is not indicative of future results.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;