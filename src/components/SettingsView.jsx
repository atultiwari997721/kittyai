import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Key, 
  Cpu, 
  Shield, 
  Radio, 
  Save, 
  Check, 
  RefreshCw, 
  ExternalLink,
  Lock,
  Volume2,
  Database
} from 'lucide-react';
import { kittyService } from '../services/kittyService';

export const SettingsView = () => {
  const [settings, setSettings] = useState(kittyService.getSettings());
  const [isSaved, setIsSaved] = useState(false);
  const [isTestingSidecar, setIsTestingSidecar] = useState(false);
  const [sidecarStatus, setSidecarStatus] = useState(null);

  useEffect(() => {
    checkSidecar();
  }, []);

  const checkSidecar = async () => {
    setIsTestingSidecar(true);
    const online = await kittyService.checkSidecarHealth();
    setSidecarStatus(online ? 'online' : 'offline');
    setIsTestingSidecar(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    kittyService.saveSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const models = [
    {
      id: 'nvidia-nim',
      name: 'NVIDIA NIM (Cloud)',
      badge: 'Llama 3.1 70B',
      desc: 'High-performance cloud inference via NVIDIA integrate.api.nvidia.com'
    },
    {
      id: 'gemini-2.0',
      name: 'Google Gemini 2.0 Flash',
      badge: 'Multimodal',
      desc: 'Google DeepMind next-generation ultra-fast reasoning model'
    },
    {
      id: 'gpt-4o',
      name: 'OpenAI GPT-4o',
      badge: 'Omni Reasoning',
      desc: 'OpenAI flagship model with versatile tool execution'
    },
    {
      id: 'groq-llama3',
      name: 'Groq LPUs (Fast)',
      badge: 'Llama 3.3 70B',
      desc: 'Sub-second real-time inference via Groq LPUs'
    },
    {
      id: 'ollama',
      name: 'Local Ollama (Offline)',
      badge: 'Private & Local',
      desc: 'Runs completely on your local machine GPU/CPU without internet'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-fuchsia-600/20 text-fuchsia-400 flex items-center justify-center border border-fuchsia-500/30">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">System Settings & AI Orchestration</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure multi-model AI keys, local sidecar connectivity, and privacy modes
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-fuchsia-500/25 transition"
        >
          {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'Changes Saved!' : 'Save Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Active AI Model Selection */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-fuchsia-400" />
            <span>Active Inference Engine</span>
          </h2>
          <p className="text-xs text-slate-400">
            Select the primary AI brain KittyAI utilizes to analyze requests and orchestrate actions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {models.map((m) => {
              const isSelected = settings.activeModel === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSettings(prev => ({ ...prev, activeModel: m.id }))}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-fuchsia-600/15 border-fuchsia-500/60 shadow-lg shadow-fuchsia-500/10'
                      : 'bg-black/30 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{m.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      isSelected ? 'bg-fuchsia-500/30 text-fuchsia-300' : 'bg-white/5 text-slate-400'
                    }`}>
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* API Keys Configuration */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-400" />
            <span>AI Provider API Keys (Stored Safely in Local Storage)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Your keys remain strictly on your client device or local sidecar. They are never transmitted to third parties.
          </p>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium">NVIDIA NIM API Key</label>
                <a 
                  href="https://build.nvidia.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-fuchsia-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  Get NVIDIA Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                placeholder="nvapi-..."
                value={settings.nvidiaApiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, nvidiaApiKey: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-fuchsia-500 font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium">Google Gemini API Key</label>
                <a 
                  href="https://aistudio.google.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-fuchsia-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  Get Gemini Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={settings.geminiApiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, geminiApiKey: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-fuchsia-500 font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium">OpenAI API Key</label>
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-fuchsia-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  Get OpenAI Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                placeholder="sk-..."
                value={settings.openaiApiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-fuchsia-500 font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium">Groq API Key</label>
                <a 
                  href="https://console.groq.com/keys" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-fuchsia-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  Get Groq Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                placeholder="gsk_..."
                value={settings.groqApiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, groqApiKey: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-fuchsia-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Local Python Sidecar Connection */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>Python Local Sidecar (Windows Native Engine)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Powers local PyAutoGUI automation, Ollama integration, and SQLite memory caching.
              </p>
            </div>

            <button
              type="button"
              onClick={checkSidecar}
              disabled={isTestingSidecar}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingSidecar ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Sidecar FastAPI URL</label>
              <input
                type="text"
                value={settings.sidecarUrl}
                onChange={(e) => setSettings(prev => ({ ...prev, sidecarUrl: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Local Ollama URL</label>
              <input
                type="text"
                value={settings.ollamaUrl}
                onChange={(e) => setSettings(prev => ({ ...prev, ollamaUrl: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
              sidecarStatus === 'online'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                sidecarStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}></span>
              <span>
                {sidecarStatus === 'online'
                  ? 'Python Sidecar Connected (Port 8000)'
                  : 'Sidecar Offline — Running via Native Browser Intelligence Engine'}
              </span>
            </div>
          </div>
        </div>

        {/* Behavior & Privacy */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Autonomous Behavior & Privacy</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-black/30 border border-white/5">
              <div>
                <div className="font-semibold text-slate-200">Auto-confirm Non-Destructive Actions</div>
                <div className="text-slate-400 text-[11px]">
                  Automatically schedule calendar invites without asking for second confirmation
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoConfirmActions}
                onChange={(e) => setSettings(prev => ({ ...prev, autoConfirmActions: e.target.checked }))}
                className="w-4 h-4 rounded text-fuchsia-600 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-black/30 border border-white/5">
              <div>
                <div className="font-semibold text-slate-200">Text-to-Speech Voice Output</div>
                <div className="text-slate-400 text-[11px]">
                  Read KittyAI assistant responses aloud using browser speech synthesis
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.speechEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, speechEnabled: e.target.checked }))}
                className="w-4 h-4 rounded text-fuchsia-600 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
