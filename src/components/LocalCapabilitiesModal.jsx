import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Folder, 
  Code, 
  Cpu, 
  Sliders, 
  Radio, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { toolService } from '../services/toolService';

export const LocalCapabilitiesModal = ({ isOpen, onClose, onOpenTerminal, onOpenPairing }) => {
  const [capabilities, setCapabilities] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchCapabilities = async () => {
    setLoading(true);
    try {
      const data = await toolService.getCapabilities();
      setCapabilities(data);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch {
      setCapabilities({
        status: 'offline',
        desktop: false,
        kernel: 'Web Control Plane',
        powershell: false,
        filesystem: false,
        vscode: false,
        ollama: false,
        os_controls: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCapabilities();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isDesktopActive = capabilities?.desktop && capabilities?.status === 'ok';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0e1322] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner ${
              isDesktopActive 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Local Execution Plane Capabilities
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 ${
                  isDesktopActive 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isDesktopActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  {isDesktopActive ? 'Runtime Ready (Port 9972)' : 'Remote / Cloud Only'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real hardware, terminal, filesystem, and model probes on this machine
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchCapabilities}
              disabled={loading}
              title="Refresh Probes"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Capabilities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Desktop Kernel */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Cpu className="w-4 h-4 text-fuchsia-400" />
                  <span>Desktop Kernel</span>
                </div>
                {isDesktopActive ? (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Not Running</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {isDesktopActive 
                  ? `Autonomous .NET engine on port ${capabilities?.port || 9972} (Zero Python requirement)`
                  : 'Start KritiAI.exe or run the installer to enable local OS execution.'}
              </p>
            </div>

            {/* 2. PowerShell Terminal */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>PowerShell Terminal</span>
                </div>
                {capabilities?.powershell ? (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Unrestricted</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">Simulated</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {capabilities?.powershell 
                  ? 'Full PowerShell process execution, script execution, pip/npm tooling.' 
                  : 'Requires local KritiAI desktop runtime on this machine.'}
              </p>
            </div>

            {/* 3. Local Filesystem */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Folder className="w-4 h-4 text-indigo-400" />
                  <span>Filesystem Engine</span>
                </div>
                {capabilities?.filesystem ? (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Direct R/W</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">Cloud Sandbox</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug truncate">
                {capabilities?.workspace ? `Workspace: ${capabilities.workspace}` : 'Active sandbox workspace.'}
              </p>
            </div>

            {/* 4. VS Code Integration */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Code className="w-4 h-4 text-blue-400" />
                  <span>VS Code CLI</span>
                </div>
                {capabilities?.vscode ? (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Detected</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">Optional</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {capabilities?.vscode 
                  ? 'Direct "code <file>" automation and project folder opening available.' 
                  : 'VS Code not in PATH. KritiAI uses built-in code editor fallback.'}
              </p>
            </div>

            {/* 5. Offline Ollama Models */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Local LLM (Ollama)</span>
                </div>
                {capabilities?.ollama ? (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Port 11434 Active</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">Optional</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {capabilities?.ollama 
                  ? 'Local offline inference active. Screen & prompts never leave device.' 
                  : 'Ollama service not running. Using cloud AI providers (Groq/Gemini).'}
              </p>
            </div>

            {/* 6. Windows OS Controls */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Windows Controls</span>
                </div>
                {capabilities?.os_controls ? (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Enabled</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">Desktop only</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Dark/Light registry theme toggles, audio master volume, and app launches.
              </p>
            </div>
          </div>

          {/* Workspace Path & Action Banner */}
          {isDesktopActive ? (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Local Execution Plane is Fully Operational</span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono truncate max-w-md">
                  Active Workspace: {capabilities?.workspace || 'Local App Directory'}
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenTerminal) onOpenTerminal();
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition flex-shrink-0"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Open Terminal</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-fuchsia-950/30 border border-fuchsia-500/30 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-fuchsia-300 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-fuchsia-400 animate-pulse" />
                  <span>Running in Web Control Plane Mode</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Connect your Windows PC using the 6-Digit Alphanumeric Code to grant terminal and file control.
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenPairing) onOpenPairing();
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition flex-shrink-0"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Pair Desktop</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/5 bg-black/40 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono">
            {lastRefreshed ? `Last Probed: ${lastRefreshed}` : 'Probing status...'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
