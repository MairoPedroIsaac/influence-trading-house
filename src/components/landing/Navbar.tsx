'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrendingUp, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Education', href: '/education' },
  ];

  const scrollToSection = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(href);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0A1128]/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-[#D4AF37] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white leading-none">INFLUENCE</span>
              <span className="text-[10px] font-medium tracking-[0.2em] text-[#D4AF37] uppercase leading-none mt-0.5">Trading House</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollToSection(link.href)}
                className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-white/80 hover:text-white px-4 py-2 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="text-sm font-semibold bg-[#D4AF37] hover:bg-[#F0D060] text-black px-5 py-2.5 rounded-lg transition-all duration-200 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              Start Free Trial
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-white/80 hover:text-white p-2">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0A1128]/95 backdrop-blur-xl border-t border-white/5">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollToSection(link.href)}
                className="block w-full text-left text-base font-medium text-white/70 hover:text-white py-2"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <Link href="/login" className="block w-full text-center text-sm font-medium text-white/80 py-2.5 border border-white/20 rounded-lg">
                Sign In
              </Link>
              <Link href="/register" className="block w-full text-center text-sm font-semibold bg-[#D4AF37] text-black py-2.5 rounded-lg">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;