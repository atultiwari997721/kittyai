import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Stars } from 'lucide-react';

const Hero = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-4 relative overflow-hidden">
      
      {/* Decorative Floating Icons (Bento-style background) */}
      <div className="hidden md:block absolute top-20 left-10 md:left-40 animate-in" style={{ animationDelay: '0.2s' }}>
        <div className="bg-white p-4 rounded-3xl shadow-lg transform -rotate-6">
          <Stars className="text-yellow-400 w-8 h-8" />
        </div>
      </div>
      <div className="hidden md:block absolute bottom-40 right-10 md:right-40 animate-in" style={{ animationDelay: '0.4s' }}>
        <div className="bg-white p-4 rounded-3xl shadow-lg transform rotate-6">
          <Zap className="text-purple-500 w-8 h-8" />
        </div>
      </div>

      <div className="relative z-10 max-w-5xl space-y-8 animate-in">
        
        {/* Pill Badge */}
        <div className="mt-8 inline-flex items-center gap-2 px-6 py-2 bg-white rounded-full shadow-sm border border-gray-100">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          <span className="text-[10px] md:text-xs font-bold text-slate-600 uppercase tracking-wider">Kriti Ai 7.0 Kratrim Version Enabled</span>
        </div>

        {/* Hero Text */}
        <h1 className="text-4xl md:text-8xl font-extrabold text-slate-900 tracking-tight leading-tight md:leading-none">
          Supercharge your <br />
          <span className="text-gradient">creativity.</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          The ultimate AI workspace. Generate code, write stories, and find answers 
          with the world's most capable model.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full justify-center">
          <Link to="/search" className="btn-primary text-lg px-8 py-4 group">
            Start Exploring <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link to="/creative" className="btn-glass text-lg px-8 py-4">
            <Zap className="text-purple-600" /> Open Studio
          </Link>

          <Link to="/login" className="px-8 py-4 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition shadow-xl border border-slate-700">
             Member Login
          </Link>
        </div>

        {/* Social Proof / Trusted By (Mock) */}
        <div className="pt-12 opacity-60">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Powered By</p>
          <div className="flex justify-center gap-8 items-center opacity-90">
             <a href="https://abecsa.in" target="_blank" rel="noopener noreferrer" className="font-bold text-2xl tracking-tighter flex items-center gap-1 hover:opacity-80 transition-opacity">
               <span className="text-[#4285F4]">A</span>
               <span className="text-[#EA4335]">B</span>
               <span className="text-[#FBBC05]">E</span>
               <span className="text-[#4285F4]">C</span>
               <span className="text-[#34A853]">S</span>
               <span className="text-[#EA4335]">A</span>
             </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
