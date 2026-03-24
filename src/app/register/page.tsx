'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrendingUp, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  const perks = ['3 free signals daily', 'No credit card required', 'Cancel anytime'];

  return (
    <div className="min-h-screen bg-[#0A1128] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 grid-pattern" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-black" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold tracking-tight text-white leading-none">INFLUENCE</span>
              <span className="text-[10px] font-medium tracking-[0.2em] text-[#D4AF37] uppercase leading-none mt-0.5">Trading House</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Start trading smarter</h1>
          <p className="text-white/40 text-sm">Create your free account in seconds</p>
        </div>

        <div className="flex items-center justify-center gap-6 mb-6">
          {perks.map((perk, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-white/40">
              <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
              {perk}
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/40 transition-colors pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#F0D060] text-black font-semibold py-3.5 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-white/20 text-center">
              By signing up you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/40">
              Already have an account?{' '}
              <Link href="/login" className="text-[#D4AF37] hover:text-[#F0D060] font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}