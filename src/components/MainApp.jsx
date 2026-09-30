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
  AlertTriangle
} from 'lucide-react';
import { ChatCopilot } from './ChatCopilot';
import { TaskCenter } from './TaskCenter';
import { DesktopControls } from './DesktopControls';
import { PluginsHub } from './PluginsHub';
import { MemoryVaultView } from './MemoryVaultView';
import { SettingsView } from './SettingsView';
import { DownloadView } from './DownloadView';
import { kritiService } from '../services/kritiService';

export const MainApp = () => {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'tasks' | 'controls' | 'plugins' | 'memory' | 'settings' | 'downloads'
  const [sidecarOnline, setSidecarOnline] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState(kritiService.resolveActiveModel());
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  useEffect(() => {
    setCurrentModel(kritiService.resolveActiveModel());

    const check = async () => {
      const online = await kritiService.checkSidecarHealth();
      setSidecarOnline(online);
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
    { id: 'tasks', label: 'Task Center', icon: Clock, badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Action` : 'Ready', urgent: pendingApprovalsCount > 0 },
    { id: 'controls', label: 'Desktop Controls', icon: Monitor, badge: 'Full OS' },
    { id: 'plugins', label: 'Plugins & Mail', icon: Layers, badge: 'Tools' },
    { id: 'memory', label: 'Memory Vault', icon: BrainCircuit, badge: 'Auto-Learn' },
    { id: 'settings', label: 'Settings & APIs', icon: Settings, badge: 'Keys' },
    { id: 'downloads', label: 'Download Windows', icon: Download, badge: '.zip/.bat' },
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

            <button
              onClick={() => setActiveTab('downloads')}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-fuchsia-500/20 transition flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Windows App</span>
            </button>
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
            { id: 'tasks', label: 'Tasks', icon: Clock, badge: pendingApprovalsCount },
            { id: 'controls', label: 'Controls', icon: Monitor },
            { id: 'memory', label: 'Memory', icon: BrainCircuit },
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
    </div>
  );
};
export default MainApp;
