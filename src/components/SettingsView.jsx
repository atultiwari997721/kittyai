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
  Database,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { kritiService } from '../services/kritiService';

export const SettingsView = () => {
  const [settings, setSettings] = useState(kritiService.getSettings());
  const [isSaved, setIsSaved] = useState(false);
  const [isTestingSidecar, setIsTestingSidecar] = useState(false);
  const [sidecarStatus, setSidecarStatus] = useState(null);
  const [keyTesting, setKeyTesting] = useState({});
  const [keyResults, setKeyResults] = useState({});

  useEffect(() => {
    checkSidecar();
    // Prefill from environment or defaults if missing in local state
    setSettings(prev => ({
      ...prev,
      groqApiKey: prev.groqApiKey || kritiService.getApiKey('groq'),
      geminiApiKey: prev.geminiApiKey || kritiService.getApiKey('gemini'),
      openaiApiKey: prev.openaiApiKey || kritiService.getApiKey('openai'),
      nvidiaApiKey: prev.nvidiaApiKey || kritiService.getApiKey('nvidia'),
      activeModel: kritiService.resolveActiveModel(prev.activeModel)
    }));
  }, []);

  const checkSidecar = async () => {
    setIsTestingSidecar(true);
    const online = await kritiService.checkSidecarHealth();
    setSidecarStatus(online ? 'online' : 'offline');
    setIsTestingSidecar(false);
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    kritiService.saveSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const testKey = async (provider, key) => {
    setKeyTesting(prev => ({ ...prev, [provider]: true }));
    setKeyResults(prev => ({ ...prev, [provider]: null }));
    const res = await kritiService.testProviderKey(provider, key);
    setKeyTesting(prev => ({ ...prev, [provider]: false }));
    setKeyResults(prev => ({ ...prev, [provider]: res }));
  };

  const models = [
    {
      id: 'groq-llama3',
      name: 'Groq LPUs (Fastest)',
      badge: 'Llama 3.3 70B',
      desc: 'Sub-second real-time inference via Groq LPUs (300+ tokens/sec)'
    },
    {
      id: 'gemini-2.0',
      name: 'Google Gemini 2.0 Flash',
      badge: 'Multimodal',
      desc: 'Google DeepMind ultra-fast reasoning model with streaming analysis'
    },
    {
      id: 'gpt-4o',
      name: 'OpenAI GPT-4o',
      badge: 'Omni Reasoning',
      desc: 'OpenAI flagship model with versatile tool execution & code intelligence'
    },
    {
      id: 'nvidia-nim',
      name: 'NVIDIA NIM (Cloud)',
      badge: 'Llama 3.1 70B',
      desc: 'High-performance cloud inference via NVIDIA integrate.api.nvidia.com'
    },
    {
      id: 'ollama',
      name: 'Local Ollama (Offline)',
      badge: '100% Private',
      desc: 'Runs completely on your local machine GPU/CPU without internet'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-fuchsia-600/20 text-fuchsia-400 flex items-center justify-center border border-fuchsia-500/30">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">System Settings & AI Orchestration</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure multi-model AI keys, Groq LPUs, local sidecar connectivity, and privacy modes
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
            Select the primary AI brain KritiAI utilizes to analyze requests, classify intents, and orchestrate actions.
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
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      {m.id === 'groq-llama3' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{m.name}</span>
                    </span>
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

        {/* API Keys Configuration with Live Test Verification */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-400" />
            <span>AI Provider API Keys (Stored Safely in Local Storage Vault)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Your keys remain strictly on your client device or local sidecar. They are never sent to unverified servers.
          </p>

          <div className="space-y-4 text-xs">
            {/* Groq LPUs (Fastest) */}
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-black/40 border border-fuchsia-500/30">
              <div className="flex items-center justify-between">
                <label className="text-slate-200 font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Groq API Key (Recommended • Ultra-Fast LPUs)</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => testKey('groq', settings.groqApiKey)}
                    disabled={keyTesting.groq || !settings.groqApiKey}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-fuchsia-600/30 hover:bg-fuchsia-600/50 text-fuchsia-200 border border-fuchsia-500/40 transition disabled:opacity-40"
                  >
                    {keyTesting.groq ? 'Testing...' : 'Test Key'}
                  </button>
                  <a 
                    href="https://console.groq.com/keys" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-fuchsia-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    Get Free Groq Key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <input
                type="password"
                placeholder="gsk_..."
                value={settings.groqApiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, groqApiKey: e.target.value }))}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-fuchsia-500 font-mono"
              />
              {keyResults.groq && (
                <div className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                  keyResults.groq.success ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                }`}>
                  {keyResults.groq.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span>{keyResults.groq.message}</span>
                </div>
              )}
            </div>

            {/* Google Gemini */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-black/20 border border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-medium flex items-center gap-1.5">
                  <span>Google Gemini API Key</span>
                  <span className="text-[10px] text-slate-500 font-normal">(Gemini 2.0 Flash)</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => testKey('gemini', settings.geminiApiKey)}
                    disabled={keyTesting.gemini || !settings.geminiApiKey}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition disabled:opacity-40"
                  >
                    {keyTesting.gemini ? 'Testing...' : 'Test Key'}
                  </button>
                  <a 
                    href="https://aistudio.google.com" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-fuchsia-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    Get Gemini Key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={settings.geminiApiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, geminiApiKey: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-fuchsia-500 font-mono"
              />
              {keyResults.gemini && (
                <div className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                  keyResults.gemini.success ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                }`}>
                  {keyResults.gemini.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span>{keyResults.gemini.message}</span>
                </div>
              )}
            </div>

            {/* OpenAI */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-black/20 border border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-medium flex items-center gap-1.5">
                  <span>OpenAI API Key</span>
                  <span className="text-[10px] text-slate-500 font-normal">(GPT-4o)</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => testKey('openai', settings.openaiApiKey)}
                    disabled={keyTesting.openai || !settings.openaiApiKey}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition disabled:opacity-40"
                  >
                    {keyTesting.openai ? 'Testing...' : 'Test Key'}
                  </button>
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-fuchsia-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    Get OpenAI Key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <input
                type="password"
                placeholder="sk-..."
                value={settings.openaiApiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-fuchsia-500 font-mono"
              />
              {keyResults.openai && (
                <div className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                  keyResults.openai.success ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                }`}>
                  {keyResults.openai.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span>{keyResults.openai.message}</span>
                </div>
              )}
            </div>

            {/* NVIDIA NIM */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-black/20 border border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-medium flex items-center gap-1.5">
                  <span>NVIDIA NIM API Key</span>
                  <span className="text-[10px] text-slate-500 font-normal">(Llama 3.1 70B)</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => testKey('nvidia', settings.nvidiaApiKey)}
                    disabled={keyTesting.nvidia || !settings.nvidiaApiKey}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition disabled:opacity-40"
                  >
                    {keyTesting.nvidia ? 'Testing...' : 'Test Key'}
                  </button>
                  <a 
                    href="https://build.nvidia.com" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-fuchsia-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    Get NVIDIA Key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <input
                type="password"
                placeholder="nvapi-..."
                value={settings.nvidiaApiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, nvidiaApiKey: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-fuchsia-500 font-mono"
              />
              {keyResults.nvidia && (
                <div className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                  keyResults.nvidia.success ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                }`}>
                  {keyResults.nvidia.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span>{keyResults.nvidia.message}</span>
                </div>
              )}
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
                : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                sidecarStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
              }`}></span>
              <span>
                {sidecarStatus === 'online'
                  ? 'Python Sidecar Connected (Port 8000)'
                  : 'Native Browser Engine Active (Direct multi-model inference & local vault)'}
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
                  Read KritiAI assistant responses aloud using browser speech synthesis
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
