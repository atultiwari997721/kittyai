'use client';

import React, { useState } from 'react';
import { Code2, Terminal, FileCode, CheckCircle2, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';

export default function CodingPage() {
  const [sessions] = useState([
    {
      id: 'sess-01',
      title: 'Fix ModuleNotFoundError: services.auth',
      file: 'server/main.py',
      timestamp: 'Today at 4:15 PM',
      status: 'applied',
      error: `Traceback (most recent call last):\n  File "server/main.py", line 42, in <module>\n    from services.auth import verify_token\nModuleNotFoundError: No module named 'services.auth'`,
      diff: `--- a/server/main.py\n+++ b/server/main.py\n@@ -40,3 +40,3 @@\n-from services.auth import verify_token\n+from sidecar.python.core.auth import verify_token\n`,
      explanation: 'Updated stale legacy import path to new sidecar Python module structure.'
    },
    {
      id: 'sess-02',
      title: 'TS2304: Cannot find name "TauriApi"',
      file: 'apps/desktop/src/App.tsx',
      timestamp: 'Yesterday at 8:30 PM',
      status: 'applied',
      error: `apps/desktop/src/App.tsx:18:9 - error TS2304: Cannot find name 'TauriApi'.\n18   const t = TauriApi.invoke('cmd');`,
      diff: `--- a/apps/desktop/src/App.tsx\n+++ b/apps/desktop/src/App.tsx\n@@ -17,2 +17,3 @@\n-  const t = TauriApi.invoke('cmd');\n+  import { invoke } from '@tauri-apps/api/core';\n+  const t = await invoke('cmd');\n`,
      explanation: 'Migrated from Tauri v1 global namespace to Tauri v2 core modular API.'
    }
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <Code2 className="w-7 h-7 text-emerald-400" />
          VS Code Developer & Coding Sessions
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review terminal diagnostics, screen-to-code generations, and unified diff patches applied by KittyAI.
        </p>
      </div>

      <div className="space-y-6">
        {sessions.map((sess) => (
          <div key={sess.id} className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyber-border pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100">{sess.title}</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  Target File: <code className="text-kitty-300 font-mono">{sess.file}</code> • {sess.timestamp}
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 w-fit">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Patch Applied (.kitty_backup safe)
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-rose-400" />
                Parsed Terminal Stack Trace:
              </div>
              <pre className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-rose-300 overflow-x-auto">
                {sess.error}
              </pre>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                Applied Unified Diff:
              </div>
              <pre className="p-3 rounded-xl bg-cyber-dark border border-cyber-border font-mono text-xs text-slate-200 overflow-x-auto">
                {sess.diff}
              </pre>
            </div>

            <div className="text-xs text-slate-400 bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="font-semibold text-slate-300">AI Explanation: </span>
              {sess.explanation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
