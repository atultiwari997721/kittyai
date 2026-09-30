import React, { useState } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Download, 
  Cpu, 
  Monitor, 
  Code2, 
  PhoneCall, 
  Database, 
  CheckCircle2, 
  HelpCircle, 
  ShieldCheck, 
  Terminal,
  Layers,
  Send,
  ExternalLink
} from 'lucide-react';

const Hero = () => {
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatResponse, setChatResponse] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clarificationInput, setClarificationInput] = useState('');

  const handleSimulateChat = (e, customText) => {
    if (e) e.preventDefault();
    const query = customText || chatPrompt;
    if (!query.trim()) return;

    setIsProcessing(true);
    setChatResponse(null);

    setTimeout(() => {
      const q = query.toLowerCase();
      if (q.includes('meeting') && (q.includes('team') || q.includes('send'))) {
        setChatResponse({
          needsClarification: true,
          clarificationQuestion: "What do you mean by 'the team'? Please provide the email addresses or WhatsApp numbers of the team members so I can send the meeting link.",
          entityToLearn: 'team',
          reasoning: "The entity 'team' is not yet stored in your personal memory. Once specified, I will remember it permanently."
        });
      } else if (q.includes('theme') || q.includes('dark mode')) {
        setChatResponse({
          needsClarification: false,
          summary: "Toggled Windows system and apps theme to Dark Mode via Windows Registry.",
          logs: ["Modified HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize", "AppsUseLightTheme = 0", "SystemUsesLightTheme = 0"]
        });
      } else if (q.includes('error') || q.includes('code') || q.includes('python')) {
        setChatResponse({
          needsClarification: false,
          summary: "Diagnosed ModuleNotFoundError in server/main.py. Applied unified diff patch with automatic .kitty_backup safety.",
          logs: ["Captured active VS Code frame", "Parsed stack trace at line 42", "Applied surgical diff patch to server/main.py"]
        });
      } else {
        setChatResponse({
          needsClarification: false,
          summary: `KittyAI processed: "${query}". Task executed across autonomous sub-agents.`,
          logs: ["Analyzed user intent via Master Router", "Executed action plan"]
        });
      }
      setIsProcessing(false);
    }, 600);
  };

  const handleClarify = (e) => {
    e.preventDefault();
    if (!clarificationInput.trim()) return;

    setIsProcessing(true);
    const clarifiedText = clarificationInput;
    setClarificationInput('');

    setTimeout(() => {
      setChatResponse({
        needsClarification: false,
        summary: `Meeting scheduled for tomorrow at 10:00 AM! Link has been generated and dispatched to: ${clarifiedText}.`,
        learnedMemory: {
          key: 'team',
          value: clarifiedText,
          notice: "Recorded 'team' in your Personal Memory Bank. You won't have to specify this again!"
        },
        logs: [
          `Saved 'team' entity mapping (${clarifiedText}) to SQLite & Supabase memory`,
          "Created Google Meet link: https://meet.google.com/kitty-auto-meet",
          `Sent invitations via Gmail SMTP and WhatsApp to ${clarifiedText}`
        ]
      });
      setIsProcessing(false);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col justify-center items-center text-center px-4 pt-28 pb-16 relative overflow-hidden font-sans">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-gradient-to-r from-fuchsia-600/15 via-indigo-600/20 to-cyan-500/15 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl space-y-8 animate-in">
        
        {/* Top Badges */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-lg backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            KittyAI 2.0 • Local-First Autonomous Personal Assistant
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight md:leading-none text-white">
          Your Autonomous Personal AI for{' '}
          <span className="bg-gradient-to-r from-fuchsia-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
            Windows, Web & Mobile
          </span>
        </h1>
        
        <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Runs locally on your PC with zero latency via <strong>Ollama</strong>, transparently observes your screen in the background, auto-fixes VS Code compiler errors, delegates calendar calls via Playwright, and remembers your personal preferences, contacts, and teams permanently.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 w-full justify-center">
          <a 
            href="/downloads/KittyAI-Windows-Setup.exe" 
            download="KittyAI-Windows-Setup.exe"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-base shadow-2xl shadow-fuchsia-500/30 flex items-center justify-center gap-2.5 transition-all hover:scale-105"
          >
            <Download className="w-5 h-5" />
            <span>Download for Windows (.exe)</span>
          </a>

          <a 
            href="#download"
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-base transition-all border border-white/10 flex items-center justify-center gap-2"
          >
            <Monitor className="w-5 h-5 text-fuchsia-400" />
            <span>Download Options</span>
          </a>

          <a 
            href="#copilot-demo"
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-base transition-all border border-white/5 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Test Copilot</span>
          </a>
        </div>

        {/* Supported AI Ecosystem Logos / Badges */}
        <div className="pt-6 border-t border-white/5 max-w-4xl mx-auto">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
            Multi-Model Orchestration & Fallback Engine
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { name: 'NVIDIA NIM APIs', desc: 'Llama 3.3 70B & DeepSeek R1', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' },
              { name: 'Google Gemini', desc: 'Gemini 2.0 Flash & 1.5 Pro', color: 'text-indigo-400 bg-indigo-950/40 border-indigo-500/30' },
              { name: 'OpenAI ChatGPT', desc: 'GPT-4o & GPT-4o Mini', color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30' },
              { name: 'Local Ollama', desc: '100% On-Device Private', color: 'text-fuchsia-400 bg-fuchsia-950/40 border-fuchsia-500/30' }
            ].map((p, idx) => (
              <div key={idx} className={`px-3.5 py-1.5 rounded-xl border text-xs flex items-center gap-2 ${p.color}`}>
                <Cpu className="w-3.5 h-3.5" />
                <span className="font-bold">{p.name}</span>
                <span className="text-[10px] opacity-75 hidden sm:inline">({p.desc})</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left pt-6">
          <div className="p-5 rounded-2xl bg-[#111726]/80 border border-white/10 space-y-2 hover:border-fuchsia-500/40 transition-all">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Monitor className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-100">Transparent Assist HUD</h3>
            <p className="text-xs text-slate-400">
              Floats seamlessly on Windows (Alt+K). Sees your screen in the background and proactively suggests tasks.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#111726]/80 border border-white/10 space-y-2 hover:border-emerald-500/40 transition-all">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-100">VS Code Developer</h3>
            <p className="text-xs text-slate-400">
              Parses terminal compiler errors and stack traces, generates surgical fixes, and applies atomic diff patches.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#111726]/80 border border-white/10 space-y-2 hover:border-rose-500/40 transition-all">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-100">Meeting Delegate</h3>
            <p className="text-xs text-slate-400">
              Headless Playwright call joiner for Google Meet & Zoom. Transcribes speech and extracts action deliverables.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#111726]/80 border border-white/10 space-y-2 hover:border-fuchsia-500/40 transition-all">
            <div className="w-9 h-9 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-100">Personal Memory Bank</h3>
            <p className="text-xs text-slate-400">
              Asks once for undefined entities (like "team"), stores them permanently, and executes automatically next time.
            </p>
          </div>
        </div>

        {/* Live Interactive Copilot Demo Box */}
        <div id="copilot-demo" className="mt-12 p-6 sm:p-8 rounded-3xl bg-[#0e1322] border border-fuchsia-500/30 text-left space-y-5 shadow-2xl max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">KittyAI Interactive Copilot</h3>
                <p className="text-[11px] text-slate-400">Natural language execution with one-time clarification & memory recording</p>
              </div>
            </div>

            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
              Live Engine
            </span>
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 text-[11px] font-semibold">Try sample:</span>
            {[
              "Schedule a meeting for tomorrow and send to the team",
              "Switch Windows theme to dark",
              "Debug Python ModuleNotFoundError"
            ].map((s) => (
              <button
                key={s}
                onClick={(e) => handleSimulateChat(e, s)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[11px] transition-all text-left truncate"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSimulateChat} className="flex gap-2">
            <input
              type="text"
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              placeholder="Ask anything: 'Schedule a meeting for tomorrow and send to the team'..."
              className="flex-1 bg-[#0a0d14] border border-white/15 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-fuchsia-500"
            />
            <button
              type="submit"
              disabled={isProcessing || !chatPrompt.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all"
            >
              {isProcessing ? (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Execute</span>
                </>
              )}
            </button>
          </form>

          {/* Clarification Card */}
          {chatResponse?.needsClarification && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 space-y-3 animate-fade-in text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>One-Time Clarification Required for: "{chatResponse.entityToLearn}"</span>
              </div>
              <p className="text-slate-200">{chatResponse.clarificationQuestion}</p>

              <form onSubmit={handleClarify} className="flex gap-2">
                <input
                  type="text"
                  value={clarificationInput}
                  onChange={(e) => setClarificationInput(e.target.value)}
                  placeholder="e.g. alice@company.com, bob@company.com, +1234567890"
                  className="flex-1 bg-black/40 border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={!clarificationInput.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  <span>Save & Dispatch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* Execution Result */}
          {chatResponse && !chatResponse.needsClarification && (
            <div className="p-4 rounded-2xl bg-fuchsia-950/40 border border-fuchsia-500/30 text-xs space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-fuchsia-300">
                  {chatResponse.learnedMemory ? 'Learned & Executed' : 'Execution Completed'}
                </span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Success
                </span>
              </div>
              <p className="text-slate-200 leading-relaxed">{chatResponse.summary}</p>

              {chatResponse.learnedMemory && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{chatResponse.learnedMemory.notice}</span>
                </div>
              )}

              {chatResponse.logs && (
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1 font-mono text-[11px] text-slate-400">
                  {chatResponse.logs.map((log, idx) => (
                    <div key={idx}>▶ {log}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dedicated Windows Download Section */}
        <div id="download" className="mt-20 p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#111726] to-[#0a0d14] border border-white/10 text-center space-y-8 max-w-4xl mx-auto shadow-2xl">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs font-semibold border border-fuchsia-500/30">
              <Download className="w-3.5 h-3.5 text-fuchsia-400" />
              Windows Official Release
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Download KittyAI for Windows
            </h2>

            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Get the native desktop experience with transparent Assist HUD, local Ollama orchestration, and VS Code screen recording.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Native Installer Card */}
            <div className="p-6 rounded-2xl bg-[#0e1322] border border-fuchsia-500/40 space-y-4 flex flex-col justify-between shadow-xl">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-fuchsia-400">RECOMMENDED</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-300">x64 Installer</span>
                </div>
                <h3 className="text-lg font-bold text-white">KittyAI Windows Setup (.exe)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Single-click native Windows executable installer. Installs desktop shell and sets up local sidecar services.
                </p>
              </div>

              <a
                href="/downloads/KittyAI-Windows-Setup.exe"
                download="KittyAI-Windows-Setup.exe"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download KittyAI-Windows-Setup.exe</span>
              </a>
            </div>

            {/* Portable Script Launcher Card */}
            <div className="p-6 rounded-2xl bg-[#0e1322] border border-white/10 space-y-4 flex flex-col justify-between shadow-xl">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-emerald-400">PORTABLE LAUNCHER</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-300">Script (.bat)</span>
                </div>
                <h3 className="text-lg font-bold text-white">KittyAI Portable Setup (.bat)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  No installation required. Launches the Python FastAPI sidecar and opens the assistant immediately on your PC.
                </p>
              </div>

              <a
                href="/downloads/KittyAI-Windows-Setup.bat"
                download="KittyAI-Windows-Setup.bat"
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-white/10"
              >
                <Download className="w-4 h-4" />
                <span>Download KittyAI-Windows-Setup.bat</span>
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <span>Requires Windows 10 / 11 (64-bit)</span>
            <span>•</span>
            <span>4 GB RAM Minimum</span>
            <span>•</span>
            <span>Local Ollama Optional</span>
            <span>•</span>
            <span>100% Free & Open-Source</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Hero;
