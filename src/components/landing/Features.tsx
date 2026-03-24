import React from 'react';
import { Target, Brain, Activity, Shield, BarChart3, Zap, LineChart, Lock, Globe } from 'lucide-react';

const features = [
  { icon: Target, title: 'Signal Accuracy', description: 'Precision-engineered signals with 87% historical win rate across all market conditions.', metric: '87% Win Rate' },
  { icon: Brain, title: 'ML Prediction Engine', description: 'Deep learning models trained on 10+ years of market data for pattern recognition.', metric: '10B+ Data Points' },
  { icon: Activity, title: 'Market Regime Detection', description: 'Real-time classification of market conditions: trending, ranging, or volatile.', metric: 'Real-time' },
  { icon: Shield, title: 'Risk Management', description: 'Automated stop-loss and take-profit levels calculated for optimal risk-reward ratios.', metric: '1:3 R/R Avg' },
  { icon: LineChart, title: 'Backtesting Engine', description: 'Validate strategies against historical data with comprehensive performance metrics.', metric: '5+ Years Data' },
  { icon: Zap, title: 'Instant Delivery', description: 'Signals delivered in under 50ms via dashboard, email, and webhook integrations.', metric: '<50ms Latency' },
  { icon: BarChart3, title: 'Portfolio Analytics', description: 'Track performance with institutional-grade analytics, drawdown analysis, and Sharpe ratios.', metric: 'Full Suite' },
  { icon: Globe, title: 'Multi-Asset Coverage', description: 'Forex, crypto, indices, and commodities — all from a single unified platform.', metric: '200+ Assets' },
  { icon: Lock, title: 'Enterprise Security', description: 'Bank-grade encryption, SOC 2 compliance, and two-factor authentication.', metric: 'SOC 2 Type II' },
];

const Features: React.FC = () => {
  return (
    <section id="features" className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-xs font-medium text-[#D4AF37]">Platform Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Built for <span className="text-gradient-gold">Serious Traders</span>
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            Every feature designed with institutional-grade precision. No fluff, no gimmicks — just the tools you need to trade profitably.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div key={i} className="group glass-card rounded-2xl p-6 lg:p-8 hover:border-[#D4AF37]/20 transition-all duration-300 hover:bg-white/[0.04]">
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <span className="text-xs font-mono text-[#D4AF37]/60 bg-[#D4AF37]/5 px-2.5 py-1 rounded-full">
                  {feature.metric}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#D4AF37] transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;