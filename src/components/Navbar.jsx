import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Download, Zap, MessageSquare, Mail, Monitor, Database } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Assistant', icon: Sparkles },
    { path: '/tasks', label: 'Tasks', icon: Monitor },
    { path: '/plugins', label: 'Plugins', icon: Mail },
    { path: '/memory', label: 'Memory', icon: Database },
    { path: '/settings', label: 'Settings', icon: Zap },
  ];

  return (
    <nav className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <div className="bg-[#0e1322]/90 backdrop-blur-xl border border-white/10 px-3 py-2 rounded-full flex items-center justify-between gap-1 shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
        <Link to="/" className="flex items-center gap-2.5 px-2 py-1 hover:opacity-85 transition-opacity">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 flex items-center justify-center shadow-md shadow-fuchsia-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-fuchsia-300 via-purple-200 to-indigo-300 bg-clip-text text-transparent">
              KritiAI
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5
                  ${isActive 
                    ? 'bg-fuchsia-950/70 text-fuchsia-300 border border-fuchsia-500/40 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'}
                `}
              >
                <Icon size={14} className={isActive ? 'text-fuchsia-400' : 'text-slate-400'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Safe Windows Download CTA */}
          <a
            href="/api/download?file=KritiAI-Setup.exe"
            download="KritiAI-Setup.exe"
            className="px-4 py-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-fuchsia-500/25 transition-all flex items-center gap-1.5 hover:scale-105"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Download Windows</span>
            <span className="sm:hidden">App</span>
          </a>

          <Link 
            to="/login"
            className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
