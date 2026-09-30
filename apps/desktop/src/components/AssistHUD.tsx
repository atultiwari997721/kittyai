import React, { useState, useEffect } from 'react';
import { Eye, Mic, MicOff, Sparkles, Monitor, Moon, Sun, Code2, PhoneCall, CheckCircle, ChevronRight, X } from 'lucide-react';
import { KittyApiClient } from '@kittyai/core';

interface Props {
  api: KittyApiClient;
  onClose?: () => void;
}

export const AssistHUD: React.FC<Props> = ({ api, onClose }) => {
  const [activeWindow, setActiveWindow] = useState('Detecting...');
  const [observation, setObservation] = useState('KittyAI Assist Mode is actively observing your desktop.');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionDone, setActionDone] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const cap = await api.captureScreen();
        setActiveWindow(cap.windowTitle || 'Windows Desktop');

        // Check context
        const titleLower = (cap.windowTitle || '').toLowerCase();
        if (titleLower.includes('code') || titleLower.includes('visual studio')) {
          setSuggestion('VS Code focused: Ready to inspect terminal stack traces or generate diff patches.');
        } else if (titleLower.includes('settings')) {
          setSuggestion('Windows Settings active: Ask me to change themes, colors, or system displays.');
        } else if (titleLower.includes('meet') || titleLower.includes('zoom') || titleLower.includes('teams')) {
          setSuggestion('Meeting detected: Click to let KittyAI Autonomous Delegate join on your behalf.');
        } else {
          setSuggestion(null);
        }
      } catch (e) {
        // quiet fallback
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [api]);

  const handleVoiceToggle = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is supported in WebKit/Blink environments. You can also type commands directly.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceText('Listening for command...');
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setVoiceText(transcript);
    };

    recognition.onend = async () => {
      setIsListening(false);
      if (voiceText && voiceText !== 'Listening for command...') {
        await executeCommand(voiceText);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const executeCommand = async (cmd: string) => {
    setIsProcessing(true);
    setActionDone(null);
    try {
      const res = await api.routeRequest(cmd);
      setActionDone(`Executed: ${res.analysis.intent} - ${res.analysis.targetAgent}`);
      setTimeout(() => setActionDone(null), 5000);
    } catch (e: any) {
      setActionDone(`Error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-[380px] rounded-2xl glass-hud p-4 text-slate-100 flex flex-col gap-3 select-none border border-kitty-500/40 shadow-2xl relative">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="font-bold text-sm bg-gradient-to-r from-kitty-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
            KittyAI Assist HUD
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
            Alt+K
          </span>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Focused Window Context */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs">
        <Monitor className="w-3.5 h-3.5 text-kitty-400 flex-shrink-0" />
        <span className="text-slate-400">Focused:</span>
        <span className="text-slate-200 font-medium truncate">{activeWindow}</span>
      </div>

      {/* Proactive Observation / Suggestion */}
      {suggestion && (
        <div className="p-3 rounded-xl bg-kitty-950/40 border border-kitty-500/30 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-kitty-400 mt-0.5 flex-shrink-0 animate-bounce" />
          <div className="text-xs text-slate-200">
            <span className="font-semibold text-kitty-300">Suggestion: </span>
            {suggestion}
          </div>
        </div>
      )}

      {/* Voice / Quick Command Input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={isListening ? 'Listening...' : 'Tell KittyAI what to do...'}
            value={voiceText}
            onChange={(e) => setVoiceText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && voiceText.trim()) {
                executeCommand(voiceText);
                setVoiceText('');
              }
            }}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-kitty-500 text-slate-100 placeholder-slate-500 pr-8"
          />
          {isProcessing && (
            <div className="absolute right-2.5 top-2.5 w-3 h-3 rounded-full border-2 border-kitty-400 border-t-transparent animate-spin"></div>
          )}
        </div>

        <button
          onClick={handleVoiceToggle}
          className={`p-2 rounded-xl transition-all ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-white/10 hover:bg-kitty-600 text-slate-200'
          }`}
          title="Voice command"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Action Pills */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => executeCommand('change theme')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 border border-white/5 hover:border-kitty-500/30 transition-all text-left"
        >
          <Moon className="w-3 h-3 text-indigo-400 flex-shrink-0" />
          <span className="truncate">Toggle Theme</span>
        </button>

        <button
          onClick={() => executeCommand('open settings')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 border border-white/5 hover:border-kitty-500/30 transition-all text-left"
        >
          <Sun className="w-3 h-3 text-amber-400 flex-shrink-0" />
          <span className="truncate">Open Settings</span>
        </button>

        <button
          onClick={() => executeCommand('fix vs code error')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 border border-white/5 hover:border-kitty-500/30 transition-all text-left"
        >
          <Code2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
          <span className="truncate">Debug VS Code</span>
        </button>

        <button
          onClick={() => executeCommand('join meeting on my behalf')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 border border-white/5 hover:border-kitty-500/30 transition-all text-left"
        >
          <PhoneCall className="w-3 h-3 text-rose-400 flex-shrink-0" />
          <span className="truncate">Delegate Call</span>
        </button>
      </div>

      {/* Feedback banner */}
      {actionDone && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 p-2 rounded-lg">
          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{actionDone}</span>
        </div>
      )}
    </div>
  );
};
