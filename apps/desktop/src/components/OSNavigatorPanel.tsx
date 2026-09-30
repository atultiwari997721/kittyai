import React, { useState } from 'react';
import { 
  Sliders, 
  Moon, 
  Sun, 
  Monitor, 
  Volume2, 
  Wifi, 
  Bluetooth, 
  Terminal, 
  Folder, 
  Layers, 
  Check, 
  Play, 
  Square,
  Sparkles,
  ExternalLink 
} from 'lucide-react';
import { KittyApiClient } from '@kittyai/core';

interface Props {
  api: KittyApiClient;
}

export const OSNavigatorPanel: React.FC<Props> = ({ api }) => {
  const [isAssistActive, setIsAssistActive] = useState(false);
  const [intervalSec, setIntervalSec] = useState(3);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const notify = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleToggleTheme = async (theme: 'dark' | 'light' | 'toggle') => {
    setIsLoading(true);
    try {
      const res = await api.toggleWindowsTheme(theme);
      notify(res.newTheme ? `Windows theme switched to ${res.newTheme.toUpperCase()} mode!` : 'Theme toggle executed');
    } catch (e: any) {
      notify(`Error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSettings = async (page: string) => {
    try {
      await api.executeOSAction({
        type: 'open_settings',
        uri: page,
        description: `Open settings: ${page}`
      });
      notify(`Navigated to ms-settings:${page}`);
    } catch (e: any) {
      notify(`Error: ${e.message}`);
    }
  };

  const handleLaunchApp = async (app: string) => {
    try {
      await api.executeOSAction({
        type: 'launch_app',
        appName: app,
        description: `Launch ${app}`
      });
      notify(`Launched ${app}`);
    } catch (e: any) {
      notify(`Error: ${e.message}`);
    }
  };

  const handleToggleAssist = async () => {
    const nextState = !isAssistActive;
    try {
      const res = await api.toggleAssistMode(nextState, intervalSec);
      setIsAssistActive(res.isMonitoring);
      notify(res.isMonitoring ? 'Assist Mode: Active in background' : 'Assist Mode: Stopped');
    } catch (e: any) {
      notify(`Error: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-kitty-400" />
            Local Windows OS & Navigation Agent
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automate Windows settings, registry theme toggles, and proactive desktop assist loop.
          </p>
        </div>

        {statusMsg && (
          <div className="px-3 py-1.5 rounded-lg bg-kitty-950/80 border border-kitty-500/40 text-xs text-kitty-300 animate-fade-in flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            {statusMsg}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Windows Theme & Personalization */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-400" />
            Theme & Display Automation
          </h3>
          <p className="text-xs text-slate-400">
            Directly toggles Windows registry keys (<code className="text-kitty-300">AppsUseLightTheme</code> & <code className="text-kitty-300">SystemUsesLightTheme</code>).
          </p>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleToggleTheme('dark')}
              disabled={isLoading}
              className="p-3 rounded-xl bg-cyber-card border border-cyber-border hover:border-kitty-500/50 flex flex-col items-center gap-2 transition-all group"
            >
              <Moon className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-slate-300">Dark Mode</span>
            </button>

            <button
              onClick={() => handleToggleTheme('light')}
              disabled={isLoading}
              className="p-3 rounded-xl bg-cyber-card border border-cyber-border hover:border-kitty-500/50 flex flex-col items-center gap-2 transition-all group"
            >
              <Sun className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-slate-300">Light Mode</span>
            </button>

            <button
              onClick={() => handleToggleTheme('toggle')}
              disabled={isLoading}
              className="p-3 rounded-xl bg-cyber-card border border-cyber-border hover:border-kitty-500/50 flex flex-col items-center gap-2 transition-all group"
            >
              <Sliders className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-slate-300">Switch Theme</span>
            </button>
          </div>

          <div className="pt-2">
            <div className="text-xs font-semibold text-slate-400 mb-2">Direct Settings Navigation:</div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Colors & Theme', uri: 'personalization-colors' },
                { label: 'Display & Scaling', uri: 'display' },
                { label: 'Sound & Audio', uri: 'sound' },
                { label: 'Wi-Fi & Network', uri: 'network-wifi' },
                { label: 'Bluetooth', uri: 'bluetooth' },
                { label: 'Apps & Features', uri: 'appsfeatures' },
              ].map((s) => (
                <button
                  key={s.uri}
                  onClick={() => handleOpenSettings(s.uri)}
                  className="px-2.5 py-1.5 rounded-lg bg-cyber-card border border-cyber-border hover:border-kitty-500/30 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3 h-3 text-kitty-400" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Background Assist Mode */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-kitty-400" />
              Background Assist Mode
            </h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              isAssistActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              {isAssistActive ? 'Running' : 'Stopped'}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Continuously monitors focused application frames, extracts context via lightweight vision analysis, and generates contextual suggestions in the HUD.
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Capture Frequency:</span>
              <span className="font-mono text-kitty-300">{intervalSec} seconds</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={intervalSec}
              onChange={(e) => setIntervalSec(Number(e.target.value))}
              disabled={isAssistActive}
              className="w-full accent-kitty-500"
            />
          </div>

          <button
            onClick={handleToggleAssist}
            className={`w-full py-2.5 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all ${
              isAssistActive
                ? 'bg-rose-600/80 hover:bg-rose-600 text-white'
                : 'bg-gradient-to-r from-kitty-600 to-indigo-600 hover:from-kitty-500 hover:to-indigo-500 text-white shadow-lg'
            }`}
          >
            {isAssistActive ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                Stop Assist Mode Loop
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Start Background Assist Loop
              </>
            )}
          </button>

          {/* Quick App Launcher */}
          <div className="pt-2 border-t border-cyber-border">
            <div className="text-xs font-semibold text-slate-400 mb-2">Fast App Launcher:</div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { name: 'VS Code', app: 'vscode' },
                { name: 'Terminal', app: 'terminal' },
                { name: 'Chrome', app: 'chrome' },
                { name: 'Explorer', app: 'explorer' },
              ].map((a) => (
                <button
                  key={a.app}
                  onClick={() => handleLaunchApp(a.app)}
                  className="p-2 rounded-lg bg-cyber-card border border-cyber-border hover:border-kitty-500/40 text-xs text-center text-slate-300 hover:text-white transition-all truncate"
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
