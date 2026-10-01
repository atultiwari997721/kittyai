import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  User, 
  Phone, 
  Bot, 
  ShieldCheck, 
  Copy, 
  Check, 
  Zap, 
  RefreshCw, 
  Smartphone,
  ChevronRight,
  Plus,
  Trash2
} from 'lucide-react';
import { kritiService } from '../services/kritiService';
import { toolService } from '../services/toolService';

export const WhatsAppWebStudio = () => {
  const [phone, setPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [dispatchResult, setDispatchResult] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [history, setHistory] = useState([]);
  const [userProfile, setUserProfile] = useState(kritiService.getUserProfile());

  // Load contacts from Memory Vault and past dispatches from localStorage
  useEffect(() => {
    loadContactsAndHistory();
  }, []);

  const loadContactsAndHistory = () => {
    setUserProfile(kritiService.getUserProfile());
    const memories = kritiService.getMemories();
    const contactList = [];

    // Extract contacts from memories
    memories.forEach(m => {
      if (m.category === 'contacts' && m.value) {
        if (m.value.members && Array.isArray(m.value.members)) {
          m.value.members.forEach(member => {
            contactList.push({
              name: member.name,
              phone: member.phone || '',
              role: member.role || 'Team Member',
              email: member.email || ''
            });
          });
        } else if (typeof m.value === 'object' && m.value.phone) {
          contactList.push({
            name: m.key,
            phone: m.value.phone,
            role: m.value.role || 'Contact',
            email: m.value.email || ''
          });
        }
      }
    });

    if (contactList.length === 0) {
      contactList.push(
        { name: 'Rahul Sharma', phone: '+919876543210', role: 'Fullstack Lead' },
        { name: 'Priya Patel', phone: '+919876543211', role: 'UI/UX Designer' },
        { name: 'Ankit Verma', phone: '+919876543212', role: 'DevOps Engineer' }
      );
    }
    setContacts(contactList);

    try {
      const savedLogs = localStorage.getItem('kritiai_whatsapp_history');
      if (savedLogs) {
        setHistory(JSON.parse(savedLogs));
      }
    } catch {}
  };

  const handleSelectContact = (c) => {
    setRecipientName(c.name);
    setPhone(c.phone);
  };

  const handleGenerateAiMessage = async (intentPrompt) => {
    const promptToUse = intentPrompt || aiPrompt;
    if (!promptToUse.trim()) return;

    setIsGenerating(true);
    try {
      const profile = userProfile || kritiService.getUserProfile();
      const target = recipientName || 'team member';
      
      const generationInstruction = `You are writing a personalized WhatsApp message on behalf of ${profile.name || 'User'} (${profile.role || 'Software Engineer'}).
Target Recipient: ${target}.
Context / Intent: ${promptToUse}.
User's Tech Stack & Context: ${(profile.techStack || []).join(', ')}.

Rules:
1. Write a natural, crisp, polite, and professional WhatsApp message ready to send.
2. Keep it concise (1 to 3 short sentences), suitable for WhatsApp chat.
3. Sign off naturally as "${profile.name || 'User'}".
4. Output ONLY the message text. No explanations, no quotes, no extra meta commentary.`;

      const aiRes = await kritiService.chat(generationInstruction, 'groq-llama3');
      const cleanReply = (aiRes.reply || '').trim().replace(/^["']|["']$/g, '');
      setMessage(cleanReply);
    } catch (e) {
      console.warn('Failed to generate AI WhatsApp message:', e);
      setMessage(`Hi ${recipientName || 'there'}, following up regarding our project updates. Let me know when you are free to sync! Best, ${userProfile.name || 'Atul'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDispatch = async (e) => {
    if (e) e.preventDefault();
    if (!phone.trim()) {
      alert('Please specify a recipient phone number.');
      return;
    }
    if (!message.trim()) {
      alert('Please enter or generate a message to send.');
      return;
    }

    setIsSending(true);
    setDispatchResult(null);

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encodedMsg = encodeURIComponent(message.trim());
    const webWhatsAppUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;
    const directApiLink = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;

    // Execute via local desktop kernel if active, or open browser window
    try {
      const isDesktop = await toolService.isDesktopOnline();
      if (isDesktop) {
        // Try launching via desktop app mode or browser automation
        await toolService.executeTool('windows_launch_app', { appName: `start "${webWhatsAppUrl}"` }).catch(() => {});
      }

      // Record in local history
      const newRecord = {
        id: 'wa_' + Date.now(),
        recipient: recipientName || phone,
        phone: phone,
        message: message.trim(),
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        status: 'DISPATCHED'
      };

      const updatedHistory = [newRecord, ...history.slice(0, 25)];
      setHistory(updatedHistory);
      localStorage.setItem('kritiai_whatsapp_history', JSON.stringify(updatedHistory));

      setDispatchResult({
        success: true,
        webUrl: webWhatsAppUrl,
        deepLink: directApiLink,
        recipient: recipientName || phone,
        phone: phone
      });

      // Automatically launch WhatsApp Web in a dedicated clean window
      const popup = window.open(webWhatsAppUrl, 'WhatsAppWebPopup', 'width=1100,height=750,menubar=no,toolbar=no,location=no');
      if (!popup) {
        // If popup blocked, direct link is provided
      }
    } catch (err) {
      console.error('Dispatch error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenWhatsAppWebDirect = () => {
    window.open('https://web.whatsapp.com', 'WhatsAppWebMain', 'width=1200,height=800');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 lg:pb-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Web OS Automation Workstation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>WhatsApp Web Studio</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono">
                AI Automated
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Log in to WhatsApp Web directly inside your environment. KritiAI uses your personal profile, learned memories, and contact directory to draft and automate messages on your behalf.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleOpenWhatsAppWebDirect}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition transform hover:scale-105"
            >
              <Smartphone className="w-4 h-4" />
              <span>Open WhatsApp Web Window</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Automator & Composer (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Message Dispatcher Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-5 shadow-xl bg-[#0e1322]/80">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">AI Automation Dispatcher</h2>
                  <p className="text-[11px] text-slate-400">Personalized messaging using learned profile context</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ready to Automate
              </span>
            </div>

            {/* Quick Contact Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Select Contact from Memory Vault:</span>
                <span className="text-[10px] text-slate-500 font-normal">Click contact to prefill</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {contacts.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectContact(c)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition ${
                      phone === c.phone 
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' 
                        : 'bg-black/40 border-white/10 text-slate-300 hover:border-emerald-500/30 hover:text-white'
                    }`}
                  >
                    <User className="w-3 h-3 text-emerald-400" />
                    <span>{c.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({c.role})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Phone & Recipient Name Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Recipient Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Phone Number (with Country Code)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* AI Smart Draft Prompts */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>AI Message Drafting (Learns from your Profile & Memories):</span>
              </label>
              
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Follow up on project status',
                  'Request a quick sync call',
                  'Confirm meeting schedule',
                  'Share API & code deliverables update',
                  'Casual check-in'
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleGenerateAiMessage(preset)}
                    disabled={isGenerating}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] transition flex items-center gap-1 disabled:opacity-50"
                  >
                    <span>{preset}</span>
                    <ChevronRight className="w-2.5 h-2.5 opacity-60" />
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Or describe what you want the AI to write..."
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-fuchsia-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleGenerateAiMessage();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleGenerateAiMessage()}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-40 flex-shrink-0"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Drafting...' : 'Generate Draft'}</span>
                </button>
              </div>
            </div>

            {/* Final Message Editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="text-slate-300 font-semibold">Message Preview (Editable):</label>
                <span className="text-[10px] text-slate-500">{message.length} characters</span>
              </div>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your drafted message will appear here..."
                className="w-full bg-black/60 border border-white/10 rounded-2xl p-3.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDispatch}
                disabled={isSending || !phone.trim() || !message.trim()}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Dispatching...' : 'Dispatch & Send via WhatsApp Web'}</span>
              </button>
            </div>

            {/* Dispatch Result Card */}
            {dispatchResult && (
              <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp Web Chat Initialized!</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">Target: {dispatchResult.phone}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Your chat with <strong>{dispatchResult.recipient}</strong> has been opened with your AI-drafted message preloaded. Click below if your browser blocked the popup:
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={dispatchResult.webUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in WhatsApp Web</span>
                  </a>
                  <a
                    href={dispatchResult.deepLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    <span>Direct API Link</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Connection Guide & Live Automation Logs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* WhatsApp Web Login / Pairing Box */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4 shadow-xl bg-[#0e1322]/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Web Connection</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                Official Web
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
              <div className="text-xs font-semibold text-slate-200">
                How to link your WhatsApp:
              </div>
              <ol className="text-[11px] text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>Click <strong>Open WhatsApp Web Window</strong> below.</li>
                <li>On your phone, open <strong>WhatsApp</strong>.</li>
                <li>Tap <strong>Menu (Android)</strong> or <strong>Settings (iPhone)</strong>.</li>
                <li>Select <strong>Linked Devices</strong> ➔ <strong>Link a Device</strong>.</li>
                <li>Point your camera at the screen to link your account.</li>
              </ol>

              <button
                onClick={handleOpenWhatsAppWebDirect}
                className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open WhatsApp Web in App Window</span>
              </button>
            </div>

            {/* Profile Info used for Automation */}
            <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>Personal AI Identity:</span>
                </span>
                <span className="text-[10px] text-fuchsia-400 font-mono">Auto-Personalized</span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-0.5">
                <div>Sender: <strong className="text-white">{userProfile.name || 'Atul'}</strong></div>
                <div>Role: <span className="text-slate-300">{userProfile.role || 'Senior Software Engineer'}</span></div>
                <div className="text-[10px] text-slate-500 truncate">
                  Context: {(userProfile.techStack || []).join(', ')}
                </div>
              </div>
            </div>
          </div>

          {/* Past Automations History */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-3 shadow-xl bg-[#0e1322]/80">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Recent WhatsApp Automations</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{history.length} logged</span>
            </div>

            {history.length === 0 ? (
              <div className="p-4 rounded-2xl bg-black/30 border border-white/5 text-center text-xs text-slate-500">
                No automated WhatsApp messages dispatched yet. Use the composer on the left to start!
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{item.recipient}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{item.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 italic line-clamp-2">
                      "{item.message}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
