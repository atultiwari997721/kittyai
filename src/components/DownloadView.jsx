import React from 'react';
import { 
  Download, 
  Monitor, 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  HardDrive, 
  CheckCircle2, 
  ExternalLink,
  Sparkles,
  Command,
  Zap
} from 'lucide-react';

export const DownloadView = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Native Windows Assistant • Version 1.0.0</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Download KittyAI for Windows
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl mx-auto leading-relaxed">
          Experience local-first AI with transparent desktop overlay HUD, native PyAutoGUI control, offline Ollama orchestration, and persistent SQLite memory.
        </p>

        {/* Download Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <a
            href="/downloads/KittyAI-Windows-Setup.exe"
            download="KittyAI-Windows-Setup.exe"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-3 shadow-xl shadow-fuchsia-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <Download className="w-5 h-5" />
            <div className="text-left">
              <div>Download Windows Installer (.exe)</div>
              <div className="text-[10px] font-normal text-fuchsia-200">Recommended for Windows 10/11 64-bit</div>
            </div>
          </a>

          <a
            href="/downloads/KittyAI-Windows-Setup.bat"
            download="KittyAI-Windows-Setup.bat"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#111726] hover:bg-[#1a233a] border border-white/10 hover:border-fuchsia-500/40 text-slate-200 hover:text-white font-semibold text-sm flex items-center justify-center gap-3 shadow-lg transition-all"
          >
            <Terminal className="w-5 h-5 text-indigo-400" />
            <div className="text-left">
              <div>Portable Windows Launcher (.bat)</div>
              <div className="text-[10px] font-normal text-slate-400">Zero installation required</div>
            </div>
          </a>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center border border-fuchsia-500/30">
            <Command className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Transparent Overlay HUD</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Press <code className="px-1.5 py-0.5 rounded bg-black/50 text-fuchsia-300 font-mono text-[10px]">Ctrl+Shift+Space</code> or <code className="px-1.5 py-0.5 rounded bg-black/50 text-fuchsia-300 font-mono text-[10px]">Alt+K</code> anytime to bring up the floating AI HUD over any Windows application.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">PyAutoGUI OS Automation</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            KittyAI controls your mouse, keyboard, and Windows UI directly to perform repetitive multi-step actions autonomously.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">100% Local Privacy</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Run completely offline using local Ollama (<code className="text-emerald-300">llama3.2</code>, <code className="text-emerald-300">deepseek-r1</code>). Your personal contacts never leave your PC.
          </p>
        </div>
      </div>

      {/* System Requirements & Quick Start */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-indigo-400" />
          <span>System Requirements & Setup Guide</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <div className="font-semibold text-slate-200">Recommended Hardware</div>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Windows 10 or 11 (64-bit)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>8 GB RAM minimum (16 GB for 70B models)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Optional: NVIDIA GPU (RTX 3060+) for local Ollama</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <div className="font-semibold text-slate-200">Quick Installation Steps</div>
            <ol className="space-y-1.5 text-slate-400 list-decimal list-inside">
              <li>Download the installer (.exe) or batch script (.bat).</li>
              <li>Launch the file to start the KittyAI background sidecar.</li>
              <li>Press <code className="px-1 py-0.5 rounded bg-black text-fuchsia-300 font-mono text-[10px]">Ctrl+Shift+Space</code> to summon KittyAI anywhere.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
