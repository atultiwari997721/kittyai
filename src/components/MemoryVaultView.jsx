import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles, 
  BrainCircuit, 
  Users, 
  Calendar, 
  Check, 
  X,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { kritiService } from '../services/kritiService';

export const MemoryVaultView = () => {
  const [memories, setMemories] = useState([]);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newCategory, setNewCategory] = useState('contacts');
  const [newValue, setNewValue] = useState('');

  const loadMemories = () => {
    setMemories(kritiService.getMemories());
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const handleAddMemory = (e) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;

    let parsedVal = newValue.trim();
    try {
      parsedVal = JSON.parse(newValue);
    } catch {
      // not raw JSON, save as structured string or array
      if (newValue.includes(',')) {
        parsedVal = { items: newValue.split(',').map(s => s.trim()) };
      } else {
        parsedVal = { description: newValue.trim() };
      }
    }

    kritiService.saveMemory(newKey.trim(), parsedVal, newCategory);
    setNewKey('');
    setNewValue('');
    setIsAdding(false);
    loadMemories();
  };

  const handleDelete = (key) => {
    if (confirm(`Remove "${key}" from your persistent memory?`)) {
      kritiService.deleteMemory(key);
      loadMemories();
    }
  };

  const filtered = memories.filter(m => 
    m.key.toLowerCase().includes(search.toLowerCase()) ||
    JSON.stringify(m.value).toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-fuchsia-600/20 text-fuchsia-400 flex items-center justify-center border border-fuchsia-500/30">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Persistent Memory Vault</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Entities, contacts, and preferences KritiAI has learned through the clarification loop
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-fuchsia-500/25 transition"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isAdding ? 'Cancel' : 'Add Entity Record'}</span>
        </button>
      </div>

      {/* Info Card explaining the loop */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-fuchsia-950/40 via-indigo-950/40 to-cyan-950/40 border border-fuchsia-500/20 text-xs text-slate-300 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">How KritiAI Remembers: </span>
          When you tell KritiAI in chat to do something for an undefined entity (like <em>"Schedule a meeting for the team"</em>), KritiAI asks you once who they are. Your reply is permanently committed here into the Memory Vault. In all future interactions, KritiAI resolves it automatically!
        </div>
      </div>

      {/* Add Memory Modal/Inline Form */}
      {isAdding && (
        <form onSubmit={handleAddMemory} className="glass-panel p-5 rounded-2xl border border-fuchsia-500/30 space-y-3 shadow-2xl animate-in">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-fuchsia-400" />
            <span>Store New Entity in Memory</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Entity Key (e.g. "project team", "client_acme", "manager")</label>
              <input
                type="text"
                required
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="project team"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-fuchsia-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-[#111726] border border-white/10 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-fuchsia-500"
              >
                <option value="contacts">Contacts & Team</option>
                <option value="calendar">Calendar & Meeting Rules</option>
                <option value="preference">Personal Preferences</option>
                <option value="credentials">Service Credentials</option>
                <option value="workspace">Workspace & Code Paths</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          <div className="text-xs">
            <label className="text-slate-400 block mb-1">
              Entity Information (JSON or comma-separated emails/phone numbers)
            </label>
            <textarea
              rows={3}
              required
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Rahul rahul@project.io, Priya priya@project.io, Ankit ankit@project.io"
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-fuchsia-500 font-mono"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white font-medium text-xs flex items-center gap-1.5 transition"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save to Persistent Memory</span>
          </button>
        </form>
      )}

      {/* Search & Stats Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memory records..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-fuchsia-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          {filtered.length} record{filtered.length === 1 ? '' : 's'} active
        </div>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((record) => (
          <div
            key={record.key}
            className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3 shadow-lg relative group hover:border-fuchsia-500/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white capitalize font-mono">
                  {record.key}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-medium">
                  {record.category}
                </span>
              </div>

              <button
                onClick={() => handleDelete(record.key)}
                className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                title="Delete Record"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-black/50 p-3 rounded-xl border border-white/5 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-36">
              <pre className="whitespace-pre-wrap">{JSON.stringify(record.value, null, 2)}</pre>
            </div>

            <div className="text-[10px] text-slate-500 flex items-center justify-between">
              <span>Updated: {new Date(record.updated_at).toLocaleDateString()}</span>
              <span className="text-emerald-400 font-medium">Persisted</span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            No memories match your query. Add one or ask KritiAI in chat!
          </div>
        )}
      </div>
    </div>
  );
};
