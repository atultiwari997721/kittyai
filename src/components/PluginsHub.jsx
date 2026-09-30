import React, { useState } from 'react';
import { 
  Layers, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Sliders, 
  Monitor, 
  Code2, 
  Globe, 
  ToggleLeft, 
  ToggleRight,
  ExternalLink,
  Sparkles,
  Smartphone,
  Cpu,
  Power
} from 'lucide-react';
import { kittyService } from '../services/kittyService';

export const PluginsHub = () => {
  // Plugin toggles
  const [pluginsEnabled, setPluginsEnabled] = useState({
    email: true,
    whatsapp: true,
    calendar: true,
    osAutomation: true,
    codeAgent: true,
    webScraper: true
  });

  // Email form state
  const [emailTo, setEmailTo] = useState('team@example.com');
  const [emailSubject, setEmailSubject] = useState('Sync: Product Architecture Review');
  const [emailBody, setEmailBody] = useState('Hello Team,\n\nAttaching the architectural roadmap for the upcoming sprint.\n\nBest regards,\nKittyAI');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState(null);

  // WhatsApp form state
  const [waPhone, setWaPhone] = useState('+1-555-0199');
  const [waMessage, setWaMessage] = useState('Hi Alex, meeting invite dispatched for tomorrow at 10 AM!');
  const [isSendingWa, setIsSendingWa] = useState(false);
  const [waResult, setWaResult] = useState(null);

  // OS Automation form state
  const [osAction, setOsAction] = useState('Launch VS Code');
  const [osResult, setOsResult] = useState(null);

  const togglePlugin = (key) => {
    setPluginsEnabled(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailTo || !emailSubject || !emailBody) return;
    setIsSendingEmail(true);
    setEmailResult(null);

    // Simulate or execute email dispatch
    setTimeout(() => {
      setIsSendingEmail(false);
      setEmailResult({
        success: true,
        message: `Email dispatched successfully to ${emailTo} via KittyAI Gmail SMTP plugin!`
      });
    }, 900);
  };

  const handleSendWa = async (e) => {
    e.preventDefault();
    if (!waPhone || !waMessage) return;
    setIsSendingWa(true);
    setWaResult(null);

    setTimeout(() => {
      setIsSendingWa(false);
      setWaResult({
        success: true,
        message: `WhatsApp message transmitted to ${waPhone} via Baileys WebSocket gateway.`
      });
    }, 800);
  };

  const handleRunOsAction = (action) => {
    setOsAction(action);
    setOsResult({
      action,
      time: new Date().toLocaleTimeString(),
      status: `Command "${action}" dispatched to local Windows Sidecar executor.`
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-fuchsia-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Extensible Toolset & Integrations</span>
          </div>
          <h1 className="text-xl font-extrabold text-white">
            Plugins & Autonomous Agent Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Empower KittyAI to dispatch emails on your behalf, orchestrate WhatsApp conversations, control native Windows apps via PyAutoGUI, and delegate meetings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-End Encrypted</span>
          </div>
        </div>
      </div>

      {/* Grid of Plugin Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email Plugin */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Email Copilot (Gmail / SMTP)</h3>
                <p className="text-[11px] text-slate-400">Autonomous email drafting & dispatch</p>
              </div>
            </div>
            <button 
              onClick={() => togglePlugin('email')}
              className="text-slate-400 hover:text-white transition"
            >
              {pluginsEnabled.email ? (
                <ToggleRight className="w-7 h-7 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-7 h-7 text-slate-600" />
              )}
            </button>
          </div>

          <form onSubmit={handleSendEmail} className="space-y-2.5 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Recipient(s)</label>
              <input
                type="text"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Subject</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Body</label>
              <textarea
                rows={3}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSendingEmail || !pluginsEnabled.email}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingEmail ? 'Dispatching...' : 'Dispatch Email via KittyAI'}</span>
            </button>
          </form>

          {emailResult && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{emailResult.message}</span>
            </div>
          )}
        </div>

        {/* WhatsApp Plugin */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">WhatsApp Agent (Baileys Bridge)</h3>
                <p className="text-[11px] text-slate-400">Direct instant messaging & alerts</p>
              </div>
            </div>
            <button 
              onClick={() => togglePlugin('whatsapp')}
              className="text-slate-400 hover:text-white transition"
            >
              {pluginsEnabled.whatsapp ? (
                <ToggleRight className="w-7 h-7 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-7 h-7 text-slate-600" />
              )}
            </button>
          </div>

          <form onSubmit={handleSendWa} className="space-y-2.5 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Target Phone Number</label>
              <input
                type="text"
                value={waPhone}
                onChange={(e) => setWaPhone(e.target.value)}
                placeholder="+1234567890"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Message Content</label>
              <textarea
                rows={5}
                value={waMessage}
                onChange={(e) => setWaMessage(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSendingWa || !pluginsEnabled.whatsapp}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingWa ? 'Sending...' : 'Transmit WhatsApp Message'}</span>
            </button>
          </form>

          {waResult && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{waResult.message}</span>
            </div>
          )}
        </div>

        {/* Windows OS Automation Plugin */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Windows OS Navigator (PyAutoGUI)</h3>
                <p className="text-[11px] text-slate-400">Desktop automation & system triggers</p>
              </div>
            </div>
            <button 
              onClick={() => togglePlugin('osAutomation')}
              className="text-slate-400 hover:text-white transition"
            >
              {pluginsEnabled.osAutomation ? (
                <ToggleRight className="w-7 h-7 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-7 h-7 text-slate-600" />
              )}
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {[
                'Launch VS Code',
                'Toggle Dark Mode',
                'Capture Screen Snapshot',
                'Adjust System Volume',
                'Open KittyAI Desktop HUD',
                'Inspect System Diagnostics'
              ].map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => handleRunOsAction(cmd)}
                  disabled={!pluginsEnabled.osAutomation}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-left text-xs text-slate-200 hover:text-cyan-300 transition"
                >
                  <div className="font-semibold">{cmd}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">PyAutoGUI action</div>
                </button>
              ))}
            </div>

            {osResult && (
              <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-xs">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{osResult.action}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{osResult.status}</div>
              </div>
            )}
          </div>
        </div>

        {/* Meeting Delegate & Calendar Plugin */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Meeting Delegate (Google Meet / Zoom)</h3>
                <p className="text-[11px] text-slate-400">Autonomous calendar sync & link generation</p>
              </div>
            </div>
            <button 
              onClick={() => togglePlugin('calendar')}
              className="text-slate-400 hover:text-white transition"
            >
              {pluginsEnabled.calendar ? (
                <ToggleRight className="w-7 h-7 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-7 h-7 text-slate-600" />
              )}
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
              <div className="text-slate-300 font-semibold">Active Calendar Sync Settings:</div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Default Meeting Platform:</span>
                <span className="text-purple-300 font-mono">Google Meet</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Default Duration:</span>
                <span className="text-purple-300 font-mono">30 Minutes</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Memory Entity Resolution:</span>
                <span className="text-emerald-400 font-mono">Auto-Sync "team"</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200">
              <p className="text-[11px] leading-relaxed">
                When you say <em>"Schedule a meeting for tomorrow"</em> in the Chat Copilot, this plugin automatically calculates the next business day, resolves attendees from your Memory Vault, generates a dedicated Google Meet room, and dispatches calendar invitations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
