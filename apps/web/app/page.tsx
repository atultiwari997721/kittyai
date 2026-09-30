'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Download, 
  Send, 
  Sliders, 
  Code2, 
  PhoneCall, 
  Layers, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Shield,
  Cpu,
  Monitor
} from 'lucide-react';

export default function DashboardPage() {
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<any>(null);
  const [clarificationInput, setClarificationInput] = useState('');

  const handleDispatch = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim()) return;

    setIsSubmitting(true);
    setDispatchResult(null);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend })
      });
      const data = await res.json();
      setDispatchResult(data);
      if (!customPrompt) setPrompt('');
    } catch (e: any) {
      alert(`Dispatch failed: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClarificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchResult?.taskId || !clarificationInput.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: dispatchResult.taskId,
          clarificationResponse: clarificationInput.trim()
        })
      });
      const data = await res.json();
      setDispatchResult(data);
      setClarificationInput('');
    } catch (e: any) {
      alert(`Error submitting clarification: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-kitty-950/90 via-[#111726] to-[#0d1322] border border-kitty-500/30 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kitty-500/20 text-kitty-300 text-xs font-semibold border border-kitty-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Multi-Agent Orchestrator Active
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Your Autonomous Personal AI Assistant for{' '}
            <span className="bg-gradient-to-r from-kitty-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
              Windows, Web & Mobile
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            KittyAI (KritiAI) runs locally on your PC with Ollama and transparent Assist Mode, while this web dashboard lets you monitor, command, and delegate tasks from anywhere.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/download"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-kitty-600 to-indigo-600 hover:from-kitty-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-kitty-500/25 transition-all hover:scale-102"
            >
              <Download className="w-4 h-4" />
              <span>Download for Windows (.msi)</span>
            </Link>

            <a
              href="#remote-command"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-sm transition-all"
            >
              <span>Remote Dispatch</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-kitty-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Remote Command Input */}
      <div id="remote-command" className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-kitty-400" />
            Master Analyzer: Remote Command Dispatcher
          </h2>
          <span className="text-[11px] text-slate-400">Works seamlessly from Mobile or Web</span>
        </div>

        <form onSubmit={handleDispatch} className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type any command: 'join my meeting on my behalf', 'switch theme to dark', 'send email to...' "
            className="flex-1 bg-cyber-dark border border-cyber-border rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-kitty-500"
          />
          <button
            type="submit"
            disabled={isSubmitting || !prompt.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-kitty-600 to-indigo-600 hover:from-kitty-500 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Dispatch</span>
              </>
            )}
          </button>
        </form>

        {/* Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-500">Try asking:</span>
          {[
            "Schedule a meeting for tomorrow and send to the team",
            "Switch Windows theme to dark",
            "Debug compiler errors in my code",
            "Remember that my team is alice@acme.com, bob@acme.com"
          ].map((s) => (
            <button
              key={s}
              onClick={() => handleDispatch(undefined, s)}
              className="px-2.5 py-1 rounded-lg bg-cyber-card border border-cyber-border hover:border-kitty-500/40 text-slate-300 hover:text-white transition-all text-left"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Active Clarification Request Card */}
        {dispatchResult?.needsClarification && (
          <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-xs space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>One-Time Clarification Required: "{dispatchResult.entityToLearn}"</span>
            </div>
            <p className="text-slate-200 leading-relaxed">{dispatchResult.clarificationQuestion}</p>

            <form onSubmit={handleClarificationSubmit} className="flex gap-2">
              <input
                type="text"
                value={clarificationInput}
                onChange={(e) => setClarificationInput(e.target.value)}
                placeholder="e.g. alice@company.com, bob@company.com, +1234567890"
                className="flex-1 bg-cyber-dark border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={isSubmitting || !clarificationInput.trim()}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <span>Save to Memory & Execute</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Completed Execution Result */}
        {dispatchResult && !dispatchResult.needsClarification && (
          <div className="p-4 rounded-xl bg-kitty-950/50 border border-kitty-500/30 text-xs text-slate-200 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-kitty-300">
                {dispatchResult.learnedMemory ? 'Learned & Executed' : 'Execution Complete'}
              </span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Done
              </span>
            </div>

            <p className="text-slate-200 leading-relaxed font-medium">
              {dispatchResult.summary || dispatchResult.analysis?.reasoning}
            </p>

            {dispatchResult.learnedMemory && (
              <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Recorded in Personal Memory Bank: "{dispatchResult.learnedMemory.key}"</span>
              </div>
            )}

            {dispatchResult.executionLog && dispatchResult.executionLog.length > 0 && (
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1 font-mono text-[11px] text-slate-400">
                {dispatchResult.executionLog.map((log: string, idx: number) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4 Core Sub-Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* OS Agent */}
        <div className="glass-panel p-5 rounded-2xl space-y-3 hover:border-kitty-500/40 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
            <Sliders className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-100">Windows OS Agent</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Direct registry theme toggles, ms-settings navigation, and Assist Mode background screen sampling.
          </p>
          <div className="pt-2 text-[11px] text-kitty-400 font-medium flex items-center gap-1">
            <span>Local PyWin32 / PyAutoGUI</span>
          </div>
        </div>

        {/* Coding Agent */}
        <div className="glass-panel p-5 rounded-2xl space-y-3 hover:border-kitty-500/40 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-100">VS Code Developer</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Targeted window capture, terminal stack trace parsing, unified diff generation, and atomic patcher.
          </p>
          <Link href="/coding" className="pt-2 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <span>View Coding Sessions</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Meeting Delegate */}
        <div className="glass-panel p-5 rounded-2xl space-y-3 hover:border-kitty-500/40 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-100">Autonomous Delegate</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Isolated Playwright headless call joiner (Google Meet/Zoom), Whisper speech scribe, and action item extractor.
          </p>
          <Link href="/meetings" className="pt-2 text-[11px] text-rose-400 font-medium flex items-center gap-1">
            <span>View Synced Meetings</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Plugin Hub */}
        <div className="glass-panel p-5 rounded-2xl space-y-3 hover:border-kitty-500/40 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-100">Universal Plugin Hub</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Gmail SMTP & OAuth sending on user behalf, WhatsApp message automation, and Calendar conflict monitoring.
          </p>
          <Link href="/plugins" className="pt-2 text-[11px] text-amber-400 font-medium flex items-center gap-1">
            <span>Manage Integrations</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Recent Autonomous Activity Feed */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-kitty-400" />
            Autonomous Task Execution Feed (Synced via Supabase)
          </h2>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Realtime Stream
          </span>
        </div>

        <div className="space-y-3">
          {[
            {
              time: 'Just now',
              agent: 'MEETING_AGENT',
              title: 'Autonomous Delegate joined Google Meet',
              desc: 'Joined "Sprint Review" on behalf of Atul, muted mic and transcribed 12 minutes of conversation.',
              badge: 'Completed',
              badgeColor: 'text-emerald-400 bg-emerald-500/10'
            },
            {
              time: '18 minutes ago',
              agent: 'CODE_AGENT',
              title: 'Patched ModuleNotFoundError in server/main.py',
              desc: 'Parsed stack trace from terminal, verified AST changes, and applied unified diff with backup.',
              badge: 'Diff Applied',
              badgeColor: 'text-emerald-400 bg-emerald-500/10'
            },
            {
              time: '1 hour ago',
              agent: 'OS_NAV',
              title: 'Toggled Windows Personalization to Dark Mode',
              desc: 'Updated AppsUseLightTheme and SystemUsesLightTheme registry keys.',
              badge: 'System Exec',
              badgeColor: 'text-indigo-400 bg-indigo-500/10'
            },
            {
              time: '2 hours ago',
              agent: 'PLUGIN_AGENT',
              title: 'Dispatched automated status email via Gmail',
              desc: 'Sent meeting action items digest to project stakeholders.',
              badge: 'Sent',
              badgeColor: 'text-amber-400 bg-amber-500/10'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-cyber-card border border-cyber-border flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-kitty-300">
                    {item.agent}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">{item.title}</span>
                </div>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.badgeColor}`}>
                  {item.badge}
                </span>
                <span className="text-[10px] text-slate-500">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
