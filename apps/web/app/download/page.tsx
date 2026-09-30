'use client';

import React from 'react';
import { 
  Download, 
  Monitor, 
  Cpu, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Terminal, 
  Code2, 
  PhoneCall, 
  FileCode,
  ArrowRight
} from 'lucide-react';

export default function DownloadPage() {
  const handleDownload = () => {
    // Direct link or alert for production build release asset
    window.location.href = '#download-started';
    alert('KittyAI Desktop installer build initiated! Once built with `npm run tauri`, the .msi installer is located in apps/desktop/src-tauri/target/release/bundle/msi/.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kitty-500/20 text-kitty-300 text-xs font-semibold border border-kitty-500/30">
          <Monitor className="w-3.5 h-3.5 text-kitty-400" />
          Native Windows Application
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Download KittyAI for{' '}
          <span className="bg-gradient-to-r from-kitty-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
            Windows 10 & 11
          </span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Experience local-first AI with transparent screen assist, direct OS navigation, VS Code debugging, and autonomous meeting delegation on your PC.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleDownload}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-kitty-600 via-purple-600 to-indigo-600 hover:from-kitty-500 hover:to-indigo-500 text-white font-bold text-base shadow-2xl shadow-kitty-500/30 flex items-center justify-center gap-3 transition-all hover:scale-105"
          >
            <Download className="w-5 h-5" />
            <span>Download KittyAI (Windows .msi / .exe)</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center justify-center gap-4 pt-2">
          <span>Version 1.0.0 (x64)</span>
          <span>•</span>
          <span>Free & Open-Source</span>
          <span>•</span>
          <span>Offline Ollama Compatible</span>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-kitty-500/10 border border-kitty-500/30 flex items-center justify-center text-kitty-400">
            <Monitor className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-100 text-sm">Transparent Floating Assist HUD</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Floats on top of Windows with hotkey (Alt+K). Sees your screen in the background and offers proactive guidance without getting in your way.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-100 text-sm">Autonomous VS Code Debugger</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Directly parses stack traces from your terminal, writes surgical fixes, and applies unified diffs with automatic backup protection.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-100 text-sm">100% Local Inference via Ollama</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Seamlessly detects and orchestrates local Qwen 2.5, DeepSeek-R1, and Llama 3 models with zero telemetry and automatic cloud fallback.
          </p>
        </div>
      </div>

      {/* Setup Guide */}
      <div className="glass-panel p-8 rounded-3xl space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-kitty-400" />
          Quick 3-Step Setup Guide
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-cyber-card border border-cyber-border space-y-2">
            <div className="text-xs font-bold text-kitty-400 font-mono">STEP 01</div>
            <h4 className="text-sm font-semibold text-slate-200">Run the Installer</h4>
            <p className="text-xs text-slate-400">
              Run <code className="text-kitty-300">KittyAI-Setup.msi</code>. It sets up the Tauri Windows app and initializes the local Python sidecar service.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-cyber-card border border-cyber-border space-y-2">
            <div className="text-xs font-bold text-kitty-400 font-mono">STEP 02</div>
            <h4 className="text-sm font-semibold text-slate-200">Connect Local Models (Optional)</h4>
            <p className="text-xs text-slate-400">
              Run <code className="text-kitty-300">ollama run qwen2.5</code> or <code className="text-kitty-300">ollama run deepseek-r1</code>. KittyAI automatically detects it on port 11434.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-cyber-card border border-cyber-border space-y-2">
            <div className="text-xs font-bold text-kitty-400 font-mono">STEP 03</div>
            <h4 className="text-sm font-semibold text-slate-200">Control Anywhere</h4>
            <p className="text-xs text-slate-400">
              Log in with your email. Your meetings, terminal fixes, and emails sync in real-time between this web dashboard and your Windows PC.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
