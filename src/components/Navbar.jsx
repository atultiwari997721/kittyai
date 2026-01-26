import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Search, Zap, MessageSquare, Instagram } from 'lucide-react';
import KLogo from './KLogo';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Sparkles },
    { path: '/search', label: 'AI Search', icon: Search },
    { path: '/creative', label: 'Studio', icon: Zap },
    { path: '/whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { path: '/kittyinsta', label: 'InstaAi', icon: Instagram },
  ];

  return (

    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-fit">
      <div className="bg-white/80 backdrop-blur-xl border border-white/40 px-2 py-2 rounded-full flex items-center justify-between gap-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <Link to="/" className="flex items-center gap-2 px-1 py-1 mr-2 hover:opacity-70 transition-opacity">
          <div className="flex items-center justify-center">
            <KLogo className="w-8 h-8" />
          </div>
          <span className="font-extrabold text-lg text-slate-800 tracking-tight">KritiAi</span>
        </Link>

        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2
                ${isActive 
                  ? 'bg-slate-100 text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
              `}
            >
              <Icon size={18} className={isActive ? 'text-blue-500' : 'text-slate-400'} />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          );
        })}

        <div className="h-6 w-px bg-slate-200 mx-2"></div>

        <Link 
          to="/login"
          className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition shadow-lg flex items-center gap-2"
        >
          Login
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
