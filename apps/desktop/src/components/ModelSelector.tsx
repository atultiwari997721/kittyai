import React, { useState, useEffect } from 'react';
import { Cpu, Cloud, ChevronDown, Check, Sparkles } from 'lucide-react';
import { KittyApiClient } from '@kittyai/core';

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  isLocal: boolean;
  supportsVision?: boolean;
  description?: string;
}

interface Props {
  api: KittyApiClient;
  onModelChange?: (modelId: string) => void;
}

export const ModelSelector: React.FC<Props> = ({ api, onModelChange }) => {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [activeModel, setActiveModel] = useState<string>('ollama:qwen2.5:latest');
  const [isOpen, setIsOpen] = useState(false);
  const [isLocalOllama, setIsLocalOllama] = useState(false);

  const fetchModels = async () => {
    try {
      const data = await api.getModels();
      setModels(data.models);
      setActiveModel(data.activeModel);
      setIsLocalOllama(data.localOllamaOnline);
    } catch (e) {
      // Mock defaults for display if sidecar not connected yet
      setModels([
        { id: 'ollama:qwen2.5:latest', name: 'Ollama - Qwen 2.5', provider: 'ollama', isLocal: true, supportsVision: true },
        { id: 'gemini:gemini-2.0-flash', name: 'Google Gemini 2.0 Flash', provider: 'gemini', isLocal: false, supportsVision: true },
        { id: 'groq:llama-3.3-70b-versatile', name: 'Groq - Llama 3.3 70B', provider: 'groq', isLocal: false },
        { id: 'openai:gpt-4o', name: 'OpenAI GPT-4o', provider: 'openai', isLocal: false, supportsVision: true }
      ]);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const selectModel = async (id: string, provider: string) => {
    setActiveModel(id);
    setIsOpen(false);
    try {
      await api.setActiveModel(id, provider);
      onModelChange?.(id);
    } catch (e) {
      console.error(e);
    }
  };

  const current = models.find(m => m.id === activeModel) || {
    name: activeModel.replace('ollama:', 'Ollama: ').replace('gemini:', 'Gemini: '),
    isLocal: activeModel.startsWith('ollama'),
    provider: activeModel.split(':')[0]
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyber-card border border-cyber-border hover:border-kitty-500/50 transition-all text-xs text-slate-200"
      >
        {current.isLocal ? (
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Local:</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-indigo-400 font-medium">
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cloud:</span>
          </span>
        )}
        <span className="font-semibold text-slate-100 max-w-[150px] truncate">{current.name}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-cyber-card border border-cyber-border shadow-2xl z-50 p-1.5 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-cyber-border mb-1">
            <span>Model Orchestrator</span>
            {isLocalOllama && (
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Ollama Active
              </span>
            )}
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
            {models.map((m) => {
              const selected = m.id === activeModel;
              return (
                <button
                  key={m.id}
                  onClick={() => selectModel(m.id, m.provider)}
                  className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors ${
                    selected ? 'bg-kitty-950/60 border border-kitty-500/40 text-kitty-200' : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {m.isLocal ? (
                      <Cpu className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Cloud className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    )}
                    <div className="truncate">
                      <div className="text-xs font-medium truncate">{m.name}</div>
                      <div className="text-[10px] text-slate-400">{m.isLocal ? '100% On-Device Private' : 'Cloud API Fallback'}</div>
                    </div>
                  </div>
                  {selected && <Check className="w-3.5 h-3.5 text-kitty-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
