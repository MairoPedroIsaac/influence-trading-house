'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Get started with basic signals and market insights.',
    features: ['5 signals per day', 'Basic market analysis', 'Email notifications', 'Community access', '1 asset class', 'Daily market brief'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: 29,
    description: 'For active traders who want an edge in the market.',
    features: ['Unlimited signals', 'ML prediction engine', 'Real-time alerts', 'Portfolio analytics', 'All asset classes', 'Market regime detection', 'Backtesting engine', 'Priority support'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Elite',
    price: 99,
    description: 'Institutional-grade tools for professional traders.',
    features: ['Everything in Pro', 'Custom strategy builder', 'API access & webhooks', 'Dedicated account manager', 'Advanced risk analytics', 'White-glove onboarding', 'Custom signal parameters', 'Institutional data feeds', 'Multi-account management'],
    cta: 'Contact Sales',
    popular: false,
  },
];

const Pricing: React.FC = () => {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="relative py-24 lg:py-32">
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-xs font-medium text-[#D4AF37]">Simple Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Choose Your <span className="text-gradient-gold">Trading Edge</span>
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto mb-8">
            Start free, upgrade when you're ready. No hidden fees, cancel anytime.
          </p>
          <div className="inline-flex items-center gap-3 bg-white/5 rounded-full p-1">
            <button onClick={() => setAnnual(false)} className={`text-sm font-medium px-5 py-2 rounded-full transition-all ${!annual ? 'bg-[#D4AF37] text-black' : 'text-white/50 hover:text-white'}`}>Monthly</button>
            <button onClick={() => setAnnual(true)} className={`text-sm font-medium px-5 py-2 rounded-full transition-all flex items-center gap-1.5 ${annual ? 'bg-[#D4AF37] text-black' : 'text-white/50 hover:text-white'}`}>
              Annual <span className={`text-xs font-semibold ${annual ? 'text-black/60' : 'text-[#D4AF37]'}`}>-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, i) => {
            const displayPrice = annual ? Math.round(plan.price * 0.8) : plan.price;
            return (
              <div key={i} className={`relative rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-b from-[#D4AF37]/10 to-transparent border-2 border-[#D4AF37]/30 hover:border-[#D4AF37]/50 lg:scale-105'
                  : 'glass-card hover:border-white/15'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1.5 bg-[#D4AF37] text-black text-xs font-semibold px-4 py-1.5 rounded-full">
                      <Sparkles className="w-3 h-3" /> Most Popular
                    </div>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                  <p className="text-sm text-white/40">{plan.description}</p>
                </div>
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">${displayPrice}</span>
                    <span className="text-sm text-white/40">/mo</span>
                  </div>
                  {annual && plan.price > 0 && (
                    <p className="text-xs text-[#D4AF37] mt-1">Save ${Math.round(plan.price * 12 * 0.2)}/year</p>
                  )}
                </div>
                <Link href="/register" className={`w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-xl transition-all duration-300 mb-8 text-sm ${
                  plan.popular
                    ? 'bg-[#D4AF37] hover:bg-[#F0D060] text-black hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                    : 'border border-white/15 text-white hover:border-white/30 hover:bg-white/5'
                }`}>
                  {plan.cta} <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="space-y-3">
                  {plan.features.map((feature, fi) => (
                    <div key={fi} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.popular ? 'bg-[#D4AF37]/20' : 'bg-white/10'}`}>
                        <Check className={`w-3 h-3 ${plan.popular ? 'text-[#D4AF37]' : 'text-white/60'}`} />
                      </div>
                      <span className="text-sm text-white/60">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;