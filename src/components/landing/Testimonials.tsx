import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  { name: 'Marcus Chen', role: 'Forex Trader', location: 'Singapore', content: 'The signal accuracy is unlike anything I\'ve seen. Went from inconsistent results to a steady 8-12% monthly return within 3 months.', rating: 5, avatar: 'MC' },
  { name: 'Sarah Williams', role: 'Portfolio Manager', location: 'London', content: 'The market regime detection alone is worth the subscription. It\'s saved me from taking trades in unfavorable conditions countless times.', rating: 5, avatar: 'SW' },
  { name: 'David Okafor', role: 'Day Trader', location: 'Lagos', content: 'I was skeptical at first, but the backtesting engine proved the strategy works. Now I trade with confidence every single day.', rating: 5, avatar: 'DO' },
  { name: 'Elena Petrov', role: 'Crypto Analyst', location: 'Zurich', content: 'The ML prediction engine catches patterns I would never spot manually. It\'s like having a team of quants working for you 24/7.', rating: 5, avatar: 'EP' },
  { name: 'James Rodriguez', role: 'Swing Trader', location: 'Miami', content: 'Clean interface, precise signals, and the risk management tools are institutional-grade. Best trading investment I\'ve made.', rating: 5, avatar: 'JR' },
  { name: 'Aiko Tanaka', role: 'Quant Developer', location: 'Tokyo', content: 'The API access on the Elite plan integrates seamlessly with my existing systems. The data quality is exceptional.', rating: 5, avatar: 'AT' },
];

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-xs font-medium text-[#D4AF37]">Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Trusted by <span className="text-gradient-gold">3,200+ Traders</span>
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            From retail traders to portfolio managers — see why professionals choose Influence Trading House.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 hover:border-[#D4AF37]/15 transition-all duration-300">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <Star key={si} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                ))}
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-6">"{t.content}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-[#D4AF37]">{t.avatar}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-white/40">{t.role} · {t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;