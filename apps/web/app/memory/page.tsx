'use client';

import React, { useState } from 'react';
import { Database, Plus, Trash2, CheckCircle2, BookOpen, Sparkles, ShieldCheck } from 'lucide-react';

export default function MemoryPage() {
  const [memories, setMemories] = useState([
    {
      key: 'team',
      value: {
        members: ['Alice', 'Bob'],
        emails: ['alice@company.com', 'bob@company.com'],
        phones: ['+1234567890']
      },
      category: 'entity',
      description: 'Learned during meeting scheduling clarification',
      updatedAt: 'Today, 4:20 PM'
    },
    {
      key: 'primary_project',
      value: 'k:/Projects/kittyai',
      category: 'project',
      description: 'Default repository path for coding agent',
      updatedAt: 'Yesterday'
    },
    {
      key: 'meeting_tool',
      value: 'Google Meet',
      category: 'preference',
      description: 'Preferred video calling platform',
      updatedAt: 'Sep 28, 2026'
    }
  ]);

  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;

    setMemories([
      ...memories,
      {
        key: newKey.toLowerCase().trim(),
        value: newValue.trim(),
        category: 'custom_fact',
        description: 'Added via Web Console',
        updatedAt: 'Just now'
      }
    ]);
    setNewKey('');
    setNewValue('');
    setSaveNotice('Record saved to personal memory bank!');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleDelete = (key: string) => {
    setMemories(memories.filter(m => m.key !== key));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Database className="w-7 h-7 text-kitty-400" />
            Personal Knowledge & Memory Bank
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Entities, contacts, and custom facts learned by KittyAI. Synced in real-time across Windows, Web, and Mobile.
          </p>
        </div>

        {saveNotice && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {saveNotice}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Memory Form */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 h-fit">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Plus className="w-4 h-4 text-kitty-400" />
            Teach KittyAI a New Fact
          </h3>
          <p className="text-xs text-slate-400">
            Define any entity name and its associated contacts, paths, or instructions.
          </p>

          <form onSubmit={handleAdd} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Entity / Fact Key</label>
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="e.g. client, marketing, manager"
                className="w-full bg-cyber-dark border border-cyber-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-kitty-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Associated Value / Contacts</label>
              <textarea
                rows={3}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="e.g. john@acme.com, +1234567890"
                className="w-full bg-cyber-dark border border-cyber-border rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-kitty-500"
              />
            </div>

            <button
              type="submit"
              disabled={!newKey.trim() || !newValue.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-kitty-600 to-indigo-600 hover:from-kitty-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Save to Memory Bank</span>
            </button>
          </form>
        </div>

        {/* Memories List */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Learned Records ({memories.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              Auto-resolved in future prompts
            </span>
          </div>

          <div className="space-y-3">
            {memories.map((m) => (
              <div
                key={m.key}
                className="glass-panel p-4 rounded-2xl space-y-2 border border-cyber-border hover:border-kitty-500/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-kitty-300">{m.key}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 uppercase tracking-wider">
                      {m.category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(m.key)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-slate-300 break-words">
                  {typeof m.value === 'object' ? JSON.stringify(m.value, null, 2) : String(m.value)}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>{m.description}</span>
                  <span>{m.updatedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
