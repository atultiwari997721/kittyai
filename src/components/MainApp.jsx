import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Layers, 
  BrainCircuit, 
  Settings, 
  Download, 
  Monitor, 
  Clock, 
  Menu, 
  X, 
  Bot, 
  Laptop, 
  Sliders, 
  Zap,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Radio,
  User,
  LogOut
} from 'lucide-react';
import { ChatCopilot } from './ChatCopilot';
import { TaskCenter } from './TaskCenter';
import { DesktopControls } from './DesktopControls';
import { PluginsHub } from './PluginsHub';
import { MemoryVaultView } from './MemoryVaultView';
import { SettingsView } from './SettingsView';
import { DownloadView } from './DownloadView';
import { TerminalWorkspace } from './TerminalWorkspace';
import { PairingModal } from './PairingModal';
import { AuthModal } from './AuthModal';
import { LocalCapabilitiesModal } from './LocalCapabilitiesModal';
import { FirstStartModal } from './FirstStartModal';
import { useAuth } from '../context/AuthContext';
import { kritiService } from '../services/kritiService';
import { toolService } from '../services/toolService';

export const MainApp = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'terminal' | 'tasks' | 'controls' | 'plugins' | 'memory' | 'settings' | 'downloads'
  const [sidecarOnline, setSidecarOnline] = useState(false);
  const [localRuntimeReady, setLocalRuntimeReady] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState(kritiService.resolveActiveModel());
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [showPairModal, setShowPairModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCapabilitiesModal, setShowCapabilitiesModal] = useState(false);
  const [showFirstStartModal, setShowFirstStartModal] = useState(false);
  const [pairingState, setPairingState] = useState(kritiService.getPairingState());

  useEffect(() => {
    setCurrentModel(kritiService.resolveActiveModel());
    setPairingState(kritiService.getPairingState());

    // Auto-reconnect previously linked desktop app
    kritiService.autoConnectPairing().then((res) => {
      if (res && res.paired) {
        setPairingState(res);
      }
    });

    // Check first start sequence
    const firstStartDone = localStorage.getItem('kritiai_first_start_completed');
    if (!firstStartDone) {
      setShowFirstStartModal(true);
    }

    const check = async () => {
      const online = await kritiService.checkSidecarHealth();
      setSidecarOnline(online);
      const isDesktop = await toolService.isDesktopOnline();
      setLocalRuntimeReady(isDesktop);
      const tasks = kritiService.getTasks();
      const waiting = tasks.filter(t => t.status === 'WAITING_APPROVAL').length;
      setPendingApprovalsCount(waiting);
    };

    check();
    const interval = setInterval(check, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleModelChange = (model) => {
    setCurrentModel(model);
    kritiService.saveSettings({ activeModel: model });
  };


  const navItems = [
    { id: 'chat', label: 'Chat Copilot', icon: MessageSquare, badge: 'Live AI' },
    { id: 'terminal', label: 'Terminal & Code', icon: Terminal, badge: 'PowerOS' },
    { id: 'tasks', label: 'Task Center', icon: Clock, badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Action` : 'Ready', urgent: pendingApprovalsCount > 0 },
    { id: 'controls', label: 'Desktop Controls', icon: Monitor, badge: 'Full OS' },
    { id: 'plugins', label: 'Plugins & Mail', icon: Layers, badge: 'Tools' },
    { id: 'memory', label: 'Memory Vault', icon: BrainCircuit, badge: 'Auto-Learn' },
    { id: 'settings', label: 'Settings & APIs', icon: Settings, badge: 'Keys' },
    { id: 'downloads', label: 'Download Windows', icon: Download, badge: '1-Click EXE' },
  ];

  return (
    <div className="flex h-screen bg-[#0a0d14] text-slate-100 overflow-hidden font-sans select-none">
      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div 
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden"
        />
      )}

      {/* Sidebar Navigation for Desktop */}
      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 z-50
        w-64 bg-[#0d121f] border-r border-white/5
        flex flex-col justify-between p-4 flex-shrink-0 transition-transform duration-300
        ${mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="space-y-6">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-extrabold text-base tracking-tight bg-gradient-to-r from-fuchsia-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                  KritiAI
                </div>
                <div className="text-[10px] text-slate-400 font-mono tracking-wider">
                  PERSONAL AI OS
                </div>
              </div>
            </div>

            <button 
              onClick={() => setMobileDrawerOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-fuchsia-600/30 via-purple-600/20 to-indigo-600/20 text-white border border-fuchsia-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-fuchsia-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    item.urgent 
                      ? 'bg-amber-500 text-black font-bold animate-pulse'
                      : active 
                      ? 'bg-fuchsia-500/30 text-fuchsia-200' 
                      : 'bg-white/5 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-3 pt-4 border-t border-white/5">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 font-medium">
                <span className={`w-2 h-2 rounded-full ${sidecarOnline ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
                <span className="text-slate-300">
                  {sidecarOnline ? 'Windows Desktop 8000' : 'Native Browser Engine'}
                </span>
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-snug">
              {sidecarOnline 
                ? 'Local PyAutoGUI & Ollama active' 
                : 'Direct inference & LocalStorage vault'}
            </p>
          </div>

          <div className="flex items-center justify-between px-2 text-[10px] text-slate-500 font-mono">
            <span>KritiAI v1.0.0</span>
            <span className="text-fuchsia-400">Windows + Web</span>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0d14] overflow-hidden relative">
        {/* Top Header */}
        <header className="h-14 sm:h-16 border-b border-white/5 px-3 sm:px-6 flex items-center justify-between bg-[#0e1322] flex-shrink-0 gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm sm:text-base capitalize">{activeTab}</span>
              <span className="hidden sm:inline text-slate-500 font-mono text-xs">/ KritiAI</span>
            </div>
          </div>

          {/* Model Selector & Download CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl px-2 py-1 text-xs">
              <Bot className="w-3.5 h-3.5 text-fuchsia-400 flex-shrink-0" />
              <select
                value={currentModel}
                onChange={(e) => handleModelChange(e.target.value)}
                className="bg-transparent text-slate-200 text-[11px] sm:text-xs focus:outline-none cursor-pointer max-w-[140px] sm:max-w-none font-medium"
              >
                <option value="groq-llama3" className="bg-[#111726]">⚡ Groq (Llama 3.3 70B)</option>
                <option value="gemini-2.0" className="bg-[#111726]">💎 Gemini 2.0 Flash</option>
                <option value="gpt-4o" className="bg-[#111726]">🧠 OpenAI GPT-4o</option>
                <option value="nvidia-nim" className="bg-[#111726]">🚀 NVIDIA NIM (70B)</option>
                <option value="ollama" className="bg-[#111726]">💻 Local Ollama (Offline)</option>
              </select>

            </div>

            {/* KritiAI ● Online | Local Runtime ● Ready Status Indicator */}
            <button
              onClick={() => setShowCapabilitiesModal(true)}
              title="View Local Execution Plane Capabilities"
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                localRuntimeReady
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                  : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/20'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${localRuntimeReady ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
                <span className="font-bold text-white">KritiAI</span>
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className={`w-1.5 h-1.5 rounded-full ${localRuntimeReady ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
                <span>{localRuntimeReady ? 'Local Runtime Ready' : 'Control Plane'}</span>
              </span>
            </button>

            {/* 6-Digit Alphanumeric Bilateral Pairing Button */}
            <button
              onClick={() => setShowPairModal(true)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                pairingState.paired
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-fuchsia-950/60 border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-900/50'
              }`}
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">
                {pairingState.paired ? `Linked: ${pairingState.code}` : 'Pair Desktop (6-Digit)'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('downloads')}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-fuchsia-500/20 transition flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Windows App</span>
            </button>

            {/* Google OAuth & Cloud Sync User Profile Button */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 text-xs flex-shrink-0">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-fuchsia-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white uppercase flex-shrink-0">
                  {user.email ? user.email.charAt(0) : 'U'}
                </div>
                <span className="hidden md:inline text-slate-300 font-mono text-[11px] max-w-[110px] truncate">
                  {user.email}
                </span>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="text-slate-400 hover:text-rose-400 p-0.5 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition flex-shrink-0"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {activeTab === 'chat' && (
            <ChatCopilot 
              onNavigateToTasks={() => setActiveTab('tasks')}
              onNavigateToMemory={() => setActiveTab('memory')}
              onNavigateToControls={() => setActiveTab('controls')}
            />
          )}
          {activeTab === 'terminal' && (
            <TerminalWorkspace onOpenPairing={() => setShowPairModal(true)} />
          )}
          {activeTab === 'tasks' && <TaskCenter />}
          {activeTab === 'controls' && <DesktopControls />}
          {activeTab === 'plugins' && <PluginsHub />}
          {activeTab === 'memory' && <MemoryVaultView />}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'downloads' && <DownloadView />}
        </div>

        {/* Responsive Mobile Bottom Navigation Bar (< 1024px) */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d121f]/95 backdrop-blur-lg border-t border-white/10 flex lg:hidden items-center justify-around py-2 px-1">
          {[
            { id: 'chat', label: 'Chat', icon: MessageSquare },
            { id: 'terminal', label: 'Terminal', icon: Terminal },
            { id: 'tasks', label: 'Tasks', icon: Clock, badge: pendingApprovalsCount },
            { id: 'controls', label: 'Controls', icon: Monitor },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => {
            const active = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl relative transition-all ${
                  active ? 'text-fuchsia-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-amber-400 text-black text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </main>

      {/* 6-Digit Alphanumeric Bilateral Pairing Modal */}
      <PairingModal
        isOpen={showPairModal}
        onClose={() => setShowPairModal(false)}
        onPairingChanged={setPairingState}
      />

      {/* Google OAuth & Email Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Local Capabilities Inspection Modal */}
      <LocalCapabilitiesModal
        isOpen={showCapabilitiesModal}
        onClose={() => setShowCapabilitiesModal(false)}
        onOpenTerminal={() => setActiveTab('terminal')}
        onOpenPairing={() => setShowPairModal(true)}
      />

      {/* First Start Setup & Capability Probe Modal */}
      <FirstStartModal
        isOpen={showFirstStartModal}
        onClose={() => setShowFirstStartModal(false)}
        onFinish={() => {
          toolService.isDesktopOnline().then(setLocalRuntimeReady);
        }}
      />
    </div>
  );
};
export default MainApp;
