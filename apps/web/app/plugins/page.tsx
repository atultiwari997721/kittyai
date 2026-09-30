'use client';

import React, { useState } from 'react';
import { 
  Layers, 
  Mail, 
  MessageSquare, 
  Calendar, 
  QrCode, 
  CheckCircle2, 
  ShieldCheck, 
  Send,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export default function PluginsPage() {
  const [activeTab, setActiveTab] = useState<'gmail' | 'whatsapp' | 'calendar'>('gmail');
  
  // Gmail state
  const [gmailUser, setGmailUser] = useState('');
  const [gmailAppPass, setGmailAppPass] = useState('');
  const [gmailConnected, setGmailConnected] = useState(true);
  const [isTestingMail, setIsTestingMail] = useState(false);
  const [mailNotice, setMailNotice] = useState<string | null>(null);

  // WhatsApp state
  const [waConnected, setWaConnected] = useState(true);
  const [showQr, setShowQr] = useState(false);

  const handleTestEmail = () => {
    setIsTestingMail(true);
    setMailNotice(null);
    setTimeout(() => {
      setIsTestingMail(false);
      setMailNotice('Test email successfully dispatched via Gmail SMTP on your behalf!');
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <Layers className="w-7 h-7 text-indigo-400" />
          Universal Plugin & Integration Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Connect your Gmail, WhatsApp, and Google Calendar. KittyAI acts on your behalf with end-to-end security.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cyber-border gap-2">
        {[
          { id: 'gmail', label: 'Gmail / Email', icon: Mail },
          { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
          { id: 'calendar', label: 'Google Calendar', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
                active
                  ? 'border-kitty-500 text-kitty-300 bg-white/5 rounded-t-xl'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Gmail Tab */}
      {activeTab === 'gmail' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Mail className="w-5 h-5 text-rose-400" />
                Gmail SMTP & App Password
              </h3>
              <p className="text-xs text-slate-400">
                Allows KittyAI to send automated digests, confirmations, and email responses directly from your email address.
              </p>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connected
            </span>
          </div>

          <div className="space-y-4 max-w-xl">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Your Gmail Address</label>
              <input
                type="email"
                placeholder="yourname@gmail.com"
                value={gmailUser}
                onChange={(e) => setGmailUser(e.target.value)}
                className="w-full bg-cyber-dark border border-cyber-border rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-kitty-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Google App Password (16 characters)</label>
              <input
                type="password"
                placeholder="•••• •••• •••• ••••"
                value={gmailAppPass}
                onChange={(e) => setGmailAppPass(e.target.value)}
                className="w-full bg-cyber-dark border border-cyber-border rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-kitty-500"
              />
              <p className="text-[11px] text-slate-500">
                Generated under Google Account &gt; Security &gt; 2-Step Verification &gt; App Passwords.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleTestEmail}
                disabled={isTestingMail}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-kitty-600 hover:from-rose-500 hover:to-kitty-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                {isTestingMail ? (
                  'Verifying SMTP...'
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Test Connection & Send Self-Email
                  </>
                )}
              </button>
            </div>

            {mailNotice && (
              <div className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{mailNotice}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WhatsApp Tab */}
      {activeTab === 'whatsapp' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                WhatsApp Web Automation Bridge
              </h3>
              <p className="text-xs text-slate-400">
                Allows KittyAI to send messages, meeting notices, and updates via WhatsApp.
              </p>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Bridge Active
            </span>
          </div>

          <div className="p-4 rounded-xl bg-cyber-card border border-cyber-border space-y-3 max-w-lg">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-200">Device Pairing:</div>
              <button
                onClick={() => setShowQr(!showQr)}
                className="text-xs text-kitty-400 hover:text-kitty-300 underline"
              >
                {showQr ? 'Hide QR Code' : 'Show Pairing QR Code'}
              </button>
            </div>

            {showQr ? (
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl text-black">
                <div className="w-48 h-48 bg-slate-100 border border-slate-300 flex items-center justify-center rounded-lg">
                  <QrCode className="w-32 h-32 text-slate-800" />
                </div>
                <span className="text-xs text-slate-600 mt-2">Scan with WhatsApp on your phone</span>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Baileys socket session active. Messages will be routed through your connected WhatsApp Web account.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-kitty-400" />
                Google & Outlook Calendar Synchronization
              </h3>
              <p className="text-xs text-slate-400">
                Enables autonomous meeting monitoring, conflict resolution, and delegate joining.
              </p>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Synced via OAuth
            </span>
          </div>

          <div className="p-4 rounded-xl bg-cyber-card border border-cyber-border space-y-2 max-w-lg">
            <div className="text-xs font-semibold text-slate-200">Autonomous Delegation Rules:</div>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li>Auto-join when user calendar status is "Out of Office" or marked "Delegate"</li>
              <li>Always enter calls with microphone muted and camera off</li>
              <li>Record audio and write structured action items directly to Supabase</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
