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
  HelpCircle,
  User,
  Code,
  Zap,
  Tag
} from 'lucide-react';
import { kritiService } from '../services/kritiService';

export const MemoryVaultView = () => {
  const [memories, setMemories] = useState([]);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newCategory, setNewCategory] = useState('contacts');
  const [newValue, setNewValue] = useState('');

  // Continuous Learning & Profile state
  const [profile, setProfile] = useState(kritiService.getUserProfile());
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(kritiService.getUserProfile());
  const [newFact, setNewFact] = useState('');

  const loadMemories = () => {
    setMemories(kritiService.getMemories());
    setProfile(kritiService.getUserProfile());
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = kritiService.saveUserProfile(profileForm);
    setProfile(updated);
    setIsEditingProfile(false);
  };

  const handleAddFact = (e) => {
    e.preventDefault();
    if (!newFact.trim()) return;
    const current = kritiService.getUserProfile();
    const updatedFacts = [newFact.trim(), ...current.learnedFacts.filter(f => f !== newFact.trim()).slice(0, 24)];
    const saved = kritiService.saveUserProfile({ ...current, learnedFacts: updatedFacts });
    setProfile(saved);
    setProfileForm(saved);
    setNewFact('');
  };

  const handleRemoveFact = (factToRemove) => {
    const current = kritiService.getUserProfile();
    const updatedFacts = current.learnedFacts.filter(f => f !== factToRemove);
    const saved = kritiService.saveUserProfile({ ...current, learnedFacts: updatedFacts });
    setProfile(saved);
    setProfileForm(saved);
  };

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
            <h1 className="text-xl font-extrabold text-white">Persistent Memory & Personal Profile Vault</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Personalized knowledge, continuous AI learning, and contact records tailored to you
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setProfileForm(profile);
              setIsEditingProfile(!isEditingProfile);
            }}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-medium text-xs flex items-center gap-1.5 transition border border-white/10"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-fuchsia-500/25 transition"
          >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isAdding ? 'Cancel' : 'Add Entity Record'}</span>
          </button>
        </div>
      </div>

      {/* User Personal Profile & Continuous AI Learning Card */}
      <div className="glass-panel p-6 rounded-3xl border border-fuchsia-500/30 space-y-5 shadow-2xl bg-[#0e1322]/90 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-fuchsia-500/30">
              {profile.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{profile.name}</h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-medium border border-fuchsia-500/30">
                  {profile.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Workspace: <span className="font-mono text-slate-300">{profile.workspacePath}</span> • {profile.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Continuous AI Learning: Active</span>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 text-xs animate-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Your Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-fuchsia-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Role / Profession</label>
                <input
                  type="text"
                  value={profileForm.role}
                  onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-fuchsia-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  value={(profileForm.techStack || []).join(', ')}
                  onChange={(e) => setProfileForm({ ...profileForm, techStack: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-fuchsia-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Workspace Directory</label>
                <input
                  type="text"
                  value={profileForm.workspacePath}
                  onChange={(e) => setProfileForm({ ...profileForm, workspacePath: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-fuchsia-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white font-medium transition"
              >
                Save Profile
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Tech Stack Tags */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Preferred Tech Stack & Tools
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(profile.techStack || []).map((tech, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs font-mono"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Learned Facts & Preferences */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Learned Personal Context & Habits ({profile.learnedFacts?.length || 0})</span>
                </span>
                <span className="text-[10px] text-slate-500">Injected into all AI prompts</span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {(profile.learnedFacts || []).map((fact, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3 text-xs text-slate-300 hover:border-white/10 transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 flex-shrink-0" />
                      <span>{fact}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveFact(fact)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition"
                      title="Remove this learned fact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Fact Form */}
              <form onSubmit={handleAddFact} className="flex gap-2 mt-2.5">
                <input
                  type="text"
                  value={newFact}
                  onChange={(e) => setNewFact(e.target.value)}
                  placeholder="Teach AI a new personal fact (e.g. 'I prefer concise answers with no filler', 'My server runs on Ubuntu')..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-fuchsia-500"
                />
                <button
                  type="submit"
                  disabled={!newFact.trim()}
                  className="px-3.5 py-2 rounded-xl bg-fuchsia-600/30 hover:bg-fuchsia-600/50 text-fuchsia-200 border border-fuchsia-500/40 text-xs font-medium flex items-center gap-1 transition disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Teach AI</span>
                </button>
              </form>
            </div>
          </div>
        )}
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
