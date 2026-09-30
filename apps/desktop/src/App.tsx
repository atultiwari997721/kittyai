import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Sliders, 
  Code2, 
  PhoneCall, 
  Layers, 
  Send, 
  Layers2, 
  Monitor, 
  ExternalLink,
  ChevronRight,
  Cpu,
  Bot
} from 'lucide-react';
import { KittyApiClient } from '@kittyai/core';
import { OSNavigatorPanel } from './components/OSNavigatorPanel';
import { CodingAgentPanel } from './components/CodingAgentPanel';
import { MeetingDelegatePanel } from './components/MeetingDelegatePanel';
import { PluginHubPanel } from './components/PluginHubPanel';
import { ModelSelector } from './components/ModelSelector';
import { AssistHUD } from './components/AssistHUD';
import { ChatAssistant } from './components/ChatAssistant';

const api = new KittyApiClient('http://127.0.0.1:8000');

export const App: React.FC = () => {
  // Check if running in transparent overlay mode
  const isOverlayMode = window.location.search.includes('overlay');

  const [activeTab, setActiveTab] = useState<'chat' | 'os' | 'coding' | 'meeting' | 'plugins'>('chat');
  const [promptInput, setPromptInput] = useState('');

  const [isRouting, setIsRouting] = useState(false);
  const [routeResult, setRouteResult] = useState<any>(null);
  const [sidecarOnline, setSidecarOnline] = useState(false);
  const [showInAppHud, setShowInAppHud] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const h = await api.getHealth();
        setSidecarOnline(h.status === 'online');
      } catch (e) {
        setSidecarOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleRouteSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptInput.trim()) return;

    setIsRouting(true);
    setRouteResult(null);
    try {
      const res = await api.routeRequest(promptInput);
      setRouteResult(res);

      // Auto-switch tab based on classified intent
      if (res.analysis.intent === 'OS_NAV') setActiveTab('os');
      else if (res.analysis.intent === 'CODE_AGENT') setActiveTab('coding');
      else if (res.analysis.intent === 'MEETING_AGENT') setActiveTab('meeting');
      else if (res.analysis.intent === 'PLUGIN_AGENT') setActiveTab('plugins');
    } catch (err: any) {
      alert(`Master Analyzer error: ${err.message}`);
    } finally {
      setIsRouting(false);
    }
  };

  const handleToggleTauriOverlay = async () => {
    try {
      // @ts-ignore
      if (window.__TAURI__) {
        // @ts-ignore
        const { invoke } = window.__TAURI__.core;
        await invoke('toggle_overlay_window');
      } else {
        // Fallback to in-app floating overlay preview
        setShowInAppHud(!showInAppHud);
      }
    } catch (e) {
      setShowInAppHud(!showInAppHud);
    }
  };

  // If running in overlay window
  if (isOverlayMode) {
    return (
      <div className="p-2 w-full h-full flex items-center justify-center bg-transparent">
        <AssistHUD api={api} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-cyber-dark text-slate-100 overflow-hidden font-sans select-none">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-cyber-border bg-[#0a0e17] flex flex-col justify-between p-4 flex-shrink-0">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-kitty-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-kitty-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight bg-gradient-to-r from-kitty-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                KittyAI
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-wider">
                PERSONAL ASSISTANT
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {[
              { id: 'chat', label: 'Chat Copilot', icon: Bot, intent: 'GENERAL_CHAT', badge: 'Memory' },
              { id: 'os', label: 'OS & Navigation', icon: Sliders, intent: 'OS_NAV', badge: 'Windows' },
              { id: 'coding', label: 'VS Code Developer', icon: Code2, intent: 'CODE_AGENT', badge: 'Auto-Fix' },
              { id: 'meeting', label: 'Meeting Delegate', icon: PhoneCall, intent: 'MEETING_AGENT', badge: 'Autonomous' },
              { id: 'plugins', label: 'Plugins & Mail', icon: Layers, intent: 'PLUGIN_AGENT', badge: 'Gmail/WA' },
            ].map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-kitty-600/30 to-indigo-600/20 text-white border border-kitty-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-kitty-400' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-3 pt-4 border-t border-cyber-border">
          <button
            onClick={handleToggleTauriOverlay}
            className="w-full py-2 px-3 rounded-xl bg-cyber-card border border-cyber-border hover:border-kitty-500/40 text-xs text-slate-300 hover:text-white flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2">
              <Monitor className="w-3.5 h-3.5 text-kitty-400" />
              <span>Floating Assist HUD</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-kitty-950 text-kitty-300 border border-kitty-500/30">
              Alt+K
            </span>
          </button>

          <div className="flex items-center justify-between px-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${sidecarOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
              {sidecarOnline ? 'Sidecar 8000 Online' : 'Connecting Sidecar...'}
            </span>
            <span className="font-mono text-slate-500">v1.0.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0c101b] overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 border-b border-cyber-border px-6 flex items-center justify-between bg-[#0e1322] flex-shrink-0">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {/* Master Analyzer Search Bar */}
            <form onSubmit={handleRouteSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Ask KittyAI: 'change theme to dark', 'fix my code error', 'join my meeting'..."
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                className="w-full bg-cyber-dark border border-cyber-border rounded-xl pl-9 pr-24 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-kitty-500 transition-colors"
              />
              <Sparkles className="w-4 h-4 text-kitty-400 absolute left-3 top-2.5" />
              <button
                type="submit"
                disabled={isRouting || !promptInput.trim()}
                className="absolute right-1.5 top-1 px-3 py-1 rounded-lg bg-kitty-600 hover:bg-kitty-500 text-white font-medium text-xs flex items-center gap-1 transition-all disabled:opacity-50"
              >
                {isRouting ? (
                  <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                ) : (
                  <>
                    <span>Route</span>
                    <ChevronRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="flex items-center gap-3">
            <ModelSelector api={api} />
          </div>
        </header>

        {/* Master Intent Router Feedback Banner */}
        {routeResult && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-gradient-to-r from-kitty-950/80 to-indigo-950/80 border border-kitty-500/30 flex items-center justify-between text-xs animate-fade-in flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-kitty-300">Master Analyzer:</span>
              <span className="px-2 py-0.5 rounded bg-kitty-900/80 text-kitty-200 font-mono text-[10px] border border-kitty-500/40">
                {routeResult.analysis.intent}
              </span>
              <span className="text-slate-300">{routeResult.analysis.reasoning}</span>
            </div>
            <button onClick={() => setRouteResult(null)} className="text-slate-400 hover:text-white text-xs">Dismiss</button>
          </div>
        )}

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'chat' && <ChatAssistant api={api} />}
          {activeTab === 'os' && <OSNavigatorPanel api={api} />}
          {activeTab === 'coding' && <CodingAgentPanel api={api} />}
          {activeTab === 'meeting' && <MeetingDelegatePanel api={api} />}
          {activeTab === 'plugins' && <PluginHubPanel api={api} />}
        </div>

        {/* In-App Floating Assist HUD Preview if not running in Tauri */}
        {showInAppHud && (
          <div className="absolute bottom-6 right-6 z-50 animate-fade-in">
            <AssistHUD api={api} onClose={() => setShowInAppHud(false)} />
          </div>
        )}
      </main>
    </div>
  );
};
export default App;
