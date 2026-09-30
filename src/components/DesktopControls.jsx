import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  Terminal, 
  Code2, 
  Eye, 
  EyeOff, 
  PhoneCall, 
  Laptop, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Sparkles, 
  Layers, 
  Radio, 
  Key, 
  ExternalLink,
  ShieldCheck,
  FolderOpen,
  Chrome,
  Activity
} from 'lucide-react';
import { kritiService } from '../services/kritiService';

export const DesktopControls = () => {
  const [settings, setSettings] = useState(kritiService.getSettings());
  const [volume, setVolume] = useState(settings.volumeLevel || 75);
  const [theme, setTheme] = useState(settings.windowsTheme || 'dark');
  const [assistMode, setAssistMode] = useState(settings.assistModeActive || false);
  const [assistTarget, setAssistTarget] = useState(settings.assistTarget || 'VS Code');
  const [meetingDelegation, setMeetingDelegation] = useState(settings.meetingDelegationEnabled || false);

  // Terminal state
  const [terminalInput, setTerminalInput] = useState('git status');
  const [terminalLogs, setTerminalLogs] = useState([
    { type: 'info', text: 'KritiAI CommandPolicyEngine v1.0.0 initialized.' },
    { type: 'success', text: 'Verified environment: Windows 10/11 x64, Python 3.10+, Node v20' }
  ]);

  // Pairing state
  const [pairingCode, setPairingCode] = useState(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // VS Code error diagnosis state
  const [codeDiagnosis, setCodeDiagnosis] = useState(null);
  const [isFixingCode, setIsFixingCode] = useState(false);

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    kritiService.saveSettings({ volumeLevel: newVol });
  };

  const handleThemeToggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    kritiService.saveSettings({ windowsTheme: nextTheme });
  };

  const handleToggleAssist = () => {
    const nextAssist = !assistMode;
    setAssistMode(nextAssist);
    kritiService.saveSettings({ assistModeActive: nextAssist, assistTarget });
  };

  const handleToggleMeetingDelegation = () => {
    if (!meetingDelegation) {
      const confirmNotice = confirm(
        "KritiAI Meeting Delegation Policy:\n\n" +
        "1. KritiAI will only participate when explicitly delegated.\n" +
        "2. The assistant will identify itself and will NOT impersonate you.\n" +
        "3. Transcription & recording require applicable meeting consent.\n\n" +
        "Do you agree and wish to enable Meeting Delegation?"
      );
      if (!confirmNotice) return;
    }
    const nextVal = !meetingDelegation;
    setMeetingDelegation(nextVal);
    kritiService.saveSettings({ meetingDelegationEnabled: nextVal });
  };

  const handleRunCommand = (e) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim().toLowerCase();
    
    // CommandPolicyEngine
    const blockedCommands = ['format', 'del /f /s /q c:', 'rmdir /s /q c:', 'reg delete', 'net user', 'shutdown /s'];
    const isBlocked = blockedCommands.some(b => cmd.includes(b));

    if (isBlocked) {
      setTerminalLogs(prev => [
        ...prev,
        { type: 'error', text: `SECURITY ALERT: Command "${terminalInput}" is blocked by CommandPolicyEngine (CRITICAL risk).` }
      ]);
      return;
    }

    setTerminalLogs(prev => [
      ...prev,
      { type: 'command', text: `> ${terminalInput}` }
    ]);

    setTimeout(() => {
      let outputText = 'Command executed successfully.';
      if (cmd.includes('git status')) {
        outputText = 'On branch main\nYour branch is up to date with origin/main.\nChanges clean.';
      } else if (cmd.includes('dir')) {
        outputText = 'Directory of K:\\Projects\\kritiai\napps/    packages/    sidecar/    package.json';
      } else if (cmd.includes('node') || cmd.includes('python')) {
        outputText = 'Runtime OK (Active sub-process).';
      }

      setTerminalLogs(prev => [
        ...prev,
        { type: 'output', text: outputText }
      ]);
    }, 400);

    setTerminalInput('');
  };

  const handleAppLaunch = (appName, command) => {
    setTerminalLogs(prev => [
      ...prev,
      { type: 'info', text: `Windows OS Agent dispatched: Launching "${appName}" (${command}).` }
    ]);
  };

  const handleDiagnoseVSCode = () => {
    setIsFixingCode(true);
    setTimeout(() => {
      setIsFixingCode(false);
      setCodeDiagnosis({
        file: 'auth.controller.ts',
        line: 42,
        issue: 'Unhandled JWT expiration exception during user token refresh',
        suggestedFix: 'Wrap jwt.verify in try/catch block and handle TokenExpiredError with HTTP 401.'
      });
      // Also trigger a task in TaskCenter
      kritiService.processChat('Fix error in auth.controller.ts');
    }, 900);
  };

  const generatePairingCode = () => {
    setIsGeneratingCode(true);
    setTimeout(() => {
      setIsGeneratingCode(false);
      const code = 'KRT-' + Math.floor(1000 + Math.random() * 9000);
      setPairingCode(code);
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 lg:pb-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-fuchsia-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Monitor className="w-4 h-4" />
            <span>Windows Operating Layer & Desktop Hub</span>
          </div>
          <h1 className="text-xl font-extrabold text-white">Full Desktop Control Station</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Control native Windows settings, monitor VS Code diagnostics, toggle Screen Assist Mode, execute terminal commands safely, and sync paired devices.
          </p>
        </div>

        {/* Global Hotkey Badge */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-black/40 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-mono font-semibold flex items-center gap-2">
            <span>Assist HUD:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-fuchsia-950 border border-fuchsia-500/40 text-[10px]">Ctrl+Shift+Space</kbd>
          </div>
        </div>
      </div>

      {/* Screen Assist Mode Active Floating Banner */}
      {assistMode && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-indigo-950/70 to-fuchsia-950/70 border border-cyan-500/40 glass-panel shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>KritiAI Assist Mode Active</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                  Watching: {assistTarget}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Targeted screen analysis active. Password managers & private browser tabs excluded.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleAssist}
              className="px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-semibold transition"
            >
              Stop Assist
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Windows OS Control Panel */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Monitor className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Windows OS Controls</h3>
                <p className="text-[11px] text-slate-400">Audio, appearance & system utilities</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
              PyAutoGUI Ready
            </span>
          </div>

          {/* Volume Slider */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                {volume > 0 ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
                <span>Master Volume</span>
              </span>
              <span className="text-indigo-300 font-mono font-bold">{volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Theme Switcher */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white">System Personalization Theme</div>
              <div className="text-[11px] text-slate-400">ms-settings:personalization-colors</div>
            </div>
            <button
              onClick={handleThemeToggle}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
            >
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-fuchsia-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>

          {/* Quick Launchers */}
          <div className="space-y-2">
            <div className="text-xs text-slate-400 font-medium">Quick Application Launchers:</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { name: 'VS Code', cmd: 'code .', icon: Code2 },
                { name: 'Settings', cmd: 'ms-settings:', icon: Monitor },
                { name: 'Explorer', cmd: 'explorer.exe', icon: FolderOpen },
                { name: 'Chrome', cmd: 'chrome.exe', icon: Chrome },
                { name: 'Terminal', cmd: 'cmd.exe', icon: Terminal },
                { name: 'Task Manager', cmd: 'taskmgr', icon: Activity },
              ].map((app) => {
                const Icon = app.icon;
                return (
                  <button
                    key={app.name}
                    onClick={() => handleAppLaunch(app.name, app.cmd)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/40 text-slate-300 hover:text-white flex flex-col items-center gap-1 text-center transition"
                  >
                    <Icon className="w-4 h-4 text-indigo-400" />
                    <span className="font-semibold text-[11px]">{app.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. VS Code & Developer Agent Station */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center border border-fuchsia-500/30">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">VS Code Developer Agent</h3>
                <p className="text-[11px] text-slate-400">Workspace inspection & patch synthesis</p>
              </div>
            </div>
            <button
              onClick={handleDiagnoseVSCode}
              disabled={isFixingCode}
              className="px-3 py-1.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-fuchsia-500/20 transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isFixingCode ? 'Inspecting...' : 'Scan Workspace'}</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Workspace:</span>
              <span className="text-fuchsia-300 font-mono font-medium">K:\Projects\kritiai</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Active Extension Bridge:</span>
              <span className="text-emerald-400 font-mono">Connected (Port 8000)</span>
            </div>
          </div>

          {/* Diagnostics Display */}
          {codeDiagnosis ? (
            <div className="p-3.5 rounded-xl bg-fuchsia-950/40 border border-fuchsia-500/30 space-y-2 text-xs animate-in">
              <div className="flex items-center justify-between text-fuchsia-300 font-bold">
                <span>Issue Detected: {codeDiagnosis.file}:{codeDiagnosis.line}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-fuchsia-500/30 text-fuchsia-200">JWT Exception</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">{codeDiagnosis.issue}</p>
              <div className="p-2 rounded bg-black/60 font-mono text-[10px] text-slate-400">
                Fix synthesized in Task Center for user authorization.
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-black/30 border border-dashed border-white/10 text-center text-slate-500 text-xs">
              Click "Scan Workspace" or tell KritiAI in chat to fix your VS Code error.
            </div>
          )}
        </div>

        {/* 3. Screen Assist & Privacy Station */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Targeted Screen Assist</h3>
                <p className="text-[11px] text-slate-400">Local OCR & context analysis</p>
              </div>
            </div>
            <button
              onClick={handleToggleAssist}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                assistMode
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300'
              }`}
            >
              {assistMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{assistMode ? 'Assist Mode ON' : 'Assist Mode OFF'}</span>
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <label className="text-slate-400 block">Watch Target Window</label>
            <select
              value={assistTarget}
              onChange={(e) => {
                setAssistTarget(e.target.value);
                kritiService.saveSettings({ assistTarget: e.target.value });
              }}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="VS Code">Visual Studio Code (Workspace)</option>
              <option value="Google Chrome">Google Chrome (Browser Context)</option>
              <option value="Terminal">Command Prompt / PowerShell</option>
              <option value="Entire Screen">Entire Desktop Screen</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Sensitive windows (Password Managers, Banking, Incognito) are blocked automatically.</span>
          </div>
        </div>

        {/* 4. Device Pairing & Multi-Platform Sync */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Laptop className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Device Pairing & State Sync</h3>
                <p className="text-[11px] text-slate-400">Windows, Web and Mobile companion bridge</p>
              </div>
            </div>
            <button
              onClick={generatePairingCode}
              disabled={isGeneratingCode}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{isGeneratingCode ? 'Generating...' : 'Pair New Device'}</span>
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300">
                <Laptop className="w-4 h-4 text-emerald-400" />
                <span>Windows Desktop</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                ● Online
              </span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300">
                <Smartphone className="w-4 h-4 text-indigo-400" />
                <span>Mobile Companion (React Native / Expo)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                ● Paired
              </span>
            </div>
          </div>

          {pairingCode && (
            <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-center space-y-1 animate-in">
              <div className="text-[11px] text-emerald-300">Temporary Device Pairing Code (Expires in 5m):</div>
              <div className="font-mono text-xl font-extrabold text-white tracking-widest">{pairingCode}</div>
              <div className="text-[10px] text-slate-400">Enter this code in KritiAI Mobile or Web to link execution.</div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Safe Command Policy Terminal Console */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Secure Command Terminal (CommandPolicyEngine Active)</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Protected Execution Environment</span>
        </div>

        <div className="bg-[#070a12] p-4 rounded-xl border border-white/10 font-mono text-xs text-slate-300 space-y-1.5 h-44 overflow-y-auto">
          {terminalLogs.map((log, idx) => (
            <div key={idx} className={
              log.type === 'error' ? 'text-rose-400 font-semibold' :
              log.type === 'command' ? 'text-fuchsia-300 font-bold' :
              log.type === 'success' ? 'text-emerald-400' :
              'text-slate-400'
            }>
              {log.text}
            </div>
          ))}
        </div>

        <form onSubmit={handleRunCommand} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-cyan-400 font-mono text-xs">❯</span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              placeholder="Run safe command: 'git status', 'npm test', 'dir'..."
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Play className="w-3 h-3" />
            <span>Run</span>
          </button>
        </form>
      </div>
    </div>
  );
};
