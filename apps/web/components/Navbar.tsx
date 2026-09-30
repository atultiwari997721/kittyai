'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, 
  LayoutDashboard, 
  PhoneCall, 
  Code2, 
  Layers, 
  Settings, 
  Download, 
  Menu, 
  X,
  Database,
  Monitor
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/memory', label: 'Memory Bank', icon: Database },
    { href: '/meetings', label: 'Meetings', icon: PhoneCall },
    { href: '/coding', label: 'Coding Sessions', icon: Code2 },
    { href: '/plugins', label: 'Plugins & Mail', icon: Layers },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0a0d14]/90 backdrop-blur-md border-b border-cyber-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-kitty-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-kitty-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-kitty-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
              KittyAI
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] px-2 py-0.5 rounded-full bg-kitty-950 text-kitty-300 border border-kitty-500/30">
              Web & Mobile Console
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-kitty-950/70 text-kitty-300 border border-kitty-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-kitty-400' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Windows Download CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/download"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-kitty-600 to-indigo-600 hover:from-kitty-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-kitty-500/20 transition-all hover:scale-102"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Windows App</span>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/download"
            className="p-2 rounded-xl bg-kitty-600 text-white"
            title="Download App"
          >
            <Download className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-cyber-border bg-[#0a0d14] px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium ${
                  isActive
                    ? 'bg-kitty-950/70 text-kitty-300 border border-kitty-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-cyber-border">
            <Link
              href="/download"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-kitty-600 text-white text-xs font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Download Desktop App</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
