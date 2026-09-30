import React, { useState } from 'react';
import { 
  Download, 
  Terminal, 
  ShieldCheck, 
  HardDrive, 
  CheckCircle2, 
  ExternalLink,
  Sparkles,
  Command,
  Zap,
  Copy,
  Check,
  Package,
  FileCode
} from 'lucide-react';

export const DownloadView = () => {
  const [copiedScript, setCopiedScript] = useState(false);
  const psCommand = 'irm https://kritiai.vercel.app/downloads/Install-KritiAI.ps1 | iex';

  const handleCopy = () => {
    navigator.clipboard.writeText(psCommand);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 lg:pb-6">
      {/* Top Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>KritiAI Official Windows Release • Version 1.0.0</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Download KritiAI for Windows
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl mx-auto leading-relaxed">
          "Your Personal AI That Gets Things Done."
          <br className="hidden sm:inline" />
          Local-First autonomous personal AI operating layer with transparent Assist HUD, native PyAutoGUI control, offline Ollama orchestration, and persistent memory.
        </p>

        {/* Safe Anti-Virus Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mt-6">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>100% Clean & Verified: No false-positive virus alerts. Standard ZIP & Open-Source Scripts.</span>
        </div>

        {/* Download Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mt-8">
          {/* Option 1: Portable ZIP Package */}
          <a
            href="/downloads/KritiAI-Windows-Portable.zip"
            download="KritiAI-Windows-Portable.zip"
            className="p-6 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-left flex items-start gap-4 shadow-xl shadow-fuchsia-500/20 transition transform hover:-translate-y-0.5 group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-1.5">
                <span>Portable Windows Package (.zip)</span>
                <Download className="w-4 h-4 opacity-80 group-hover:translate-y-0.5 transition" />
              </div>
              <div className="text-xs font-normal text-fuchsia-100 mt-1">
                Zero installation. Extract and double-click to launch sidecar & assistant.
              </div>
              <div className="text-[10px] text-fuchsia-200 mt-2 font-mono">
                Includes .bat launcher, setup script & readme
              </div>
            </div>
          </a>

          {/* Option 2: Direct Batch Script Launcher */}
          <a
            href="/downloads/KritiAI-Setup.bat"
            download="KritiAI-Setup.bat"
            className="p-6 rounded-2xl bg-[#111726] hover:bg-[#182137] border border-white/10 hover:border-fuchsia-500/40 text-white font-bold text-left flex items-start gap-4 shadow-lg transition transform hover:-translate-y-0.5 group"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 border border-indigo-500/30">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-1.5">
                <span>Windows One-Click Setup (.bat)</span>
                <Download className="w-4 h-4 text-indigo-400 group-hover:translate-y-0.5 transition" />
              </div>
              <div className="text-xs font-normal text-slate-400 mt-1">
                Standalone launcher script. Automatically initializes Python sidecar & opens workspace.
              </div>
              <div className="text-[10px] text-emerald-400 mt-2 font-mono">
                Clean text batch • Instant run
              </div>
            </div>
          </a>
        </div>

        {/* Option 3: PowerShell One-Line Command */}
        <div className="mt-6 max-w-3xl mx-auto p-4 rounded-2xl bg-black/50 border border-white/10 text-left">
          <div className="text-xs text-slate-400 font-semibold mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>Or Run via Windows PowerShell (Admin Recommended):</span>
            </span>
            <button
              onClick={handleCopy}
              className="text-fuchsia-400 hover:text-fuchsia-300 text-xs flex items-center gap-1 font-mono transition"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedScript ? 'Copied to Clipboard!' : 'Copy Command'}</span>
            </button>
          </div>
          <code className="block p-3 rounded-xl bg-black font-mono text-xs text-emerald-400 overflow-x-auto select-all">
            {psCommand}
          </code>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center border border-fuchsia-500/30">
            <Command className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Transparent Assist HUD</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Press <code className="px-1.5 py-0.5 rounded bg-black/50 text-fuchsia-300 font-mono text-[10px]">Ctrl+Shift+Space</code> or <code className="px-1.5 py-0.5 rounded bg-black/50 text-fuchsia-300 font-mono text-[10px]">Alt+K</code> anytime to toggle the floating AI HUD over any Windows application.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">PyAutoGUI Automation</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            KritiAI controls mouse, keyboard, and Windows UI to automate multi-step workflows like opening settings, launching apps, and diagnosing build errors.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">100% Local Privacy</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Run completely offline using local Ollama (<code className="text-emerald-300">llama3.2</code>, <code className="text-emerald-300">deepseek-r1</code>). Your screen context and personal contacts never leave your PC.
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
              <li>Download the Portable ZIP package or Setup batch script.</li>
              <li>Extract and run <code className="px-1 py-0.5 rounded bg-black text-fuchsia-300 font-mono text-[10px]">KritiAI-Setup.bat</code> (runs defaultly on port 9972).</li>
              <li>Press <code className="px-1 py-0.5 rounded bg-black text-fuchsia-300 font-mono text-[10px]">Ctrl+Shift+Space</code> to summon KritiAI anywhere.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
