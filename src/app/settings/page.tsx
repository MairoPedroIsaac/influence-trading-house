import React from 'react';
import Link from 'next/link';
import { User, Bell, Shield, CreditCard, Globe } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#0A1128] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-white/40 mt-1">Manage your account preferences</p>
        </div>

        <div className="space-y-4">
          {[
            { icon: User, title: 'Profile', desc: 'Update your name, email and avatar' },
            { icon: Bell, title: 'Notifications', desc: 'Configure signal and alert preferences' },
            { icon: Shield, title: 'Security', desc: 'Password, 2FA and session management' },
            { icon: CreditCard, title: 'Billing', desc: 'Manage your subscription and payments' },
            { icon: Globe, title: 'Preferences', desc: 'Timezone, currency and display settings' },
          ].map((item, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 flex items-center justify-between hover:border-[#D4AF37]/20 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors">
                  <item.icon className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-[#D4AF37] transition-colors">{item.title}</h3>
                  <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
                </div>
              </div>
              <span className="text-white/20 group-hover:text-[#D4AF37] transition-colors">→</span>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/dashboard" className="text-sm text-[#D4AF37] hover:text-[#F0D060] transition-colors">← Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}