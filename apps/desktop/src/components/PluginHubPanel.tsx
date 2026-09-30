import React, { useState } from 'react';
import { Layers, Mail, MessageSquare, Calendar, Send, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { KittyApiClient } from '@kittyai/core';

interface Props {
  api: KittyApiClient;
}

export const PluginHubPanel: React.FC<Props> = ({ api }) => {
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  const [waPhone, setWaPhone] = useState('');
  const [waMsg, setWaMsg] = useState('');
  const [isSendingWa, setIsSendingWa] = useState(false);
  const [waStatus, setWaStatus] = useState<string | null>(null);

  const handleSendEmail = async () => {
    if (!emailTo || !emailSubject || !emailBody) {
      alert('Please fill out all email fields.');
      return;
    }
    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await api.sendEmail({
        to: emailTo.split(',').map(s => s.trim()),
        subject: emailSubject,
        body: emailBody
      });
      setEmailStatus('Email sent successfully on your behalf!');
      setEmailSubject('');
      setEmailBody('');
    } catch (e: any) {
      setEmailStatus(`Error: ${e.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendWa = async () => {
    if (!waPhone || !waMsg) {
      alert('Please fill out WhatsApp phone number and message.');
      return;
    }
    setIsSendingWa(true);
    setWaStatus(null);
    try {
      await api.sendWhatsApp({
        phoneNumber: waPhone,
        message: waMsg
      });
      setWaStatus('WhatsApp message sent!');
      setWaMsg('');
    } catch (e: any) {
      setWaStatus(`Error: ${e.message}`);
    } finally {
      setIsSendingWa(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Universal Plugin & Communication Hub
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch emails on your behalf, trigger WhatsApp messages, and sync calendar schedules across desktop and mobile.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            End-to-End Encrypted
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gmail Dispatch */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Mail className="w-4 h-4 text-rose-400" />
              Send Email on User Behalf (Gmail SMTP)
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Connected
            </span>
          </div>

          <div className="space-y-2.5">
            <input
              type="text"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="Recipient email(s) comma separated..."
              className="w-full bg-cyber-dark/80 border border-cyber-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            />
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Email subject..."
              className="w-full bg-cyber-dark/80 border border-cyber-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            />
            <textarea
              rows={4}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Write your email body here or let KittyAI draft it..."
              className="w-full bg-cyber-dark/80 border border-cyber-border rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            />

            <button
              onClick={handleSendEmail}
              disabled={isSendingEmail}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
            >
              {isSendingEmail ? (
                'Dispatching email...'
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Send Email via KittyAI
                </>
              )}
            </button>

            {emailStatus && (
              <div className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{emailStatus}</span>
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp Bridge */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              WhatsApp Message Dispatcher
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Active Bridge
            </span>
          </div>

          <div className="space-y-2.5">
            <input
              type="text"
              value={waPhone}
              onChange={(e) => setWaPhone(e.target.value)}
              placeholder="Phone number with country code (e.g. +1234567890)"
              className="w-full bg-cyber-dark/80 border border-cyber-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <textarea
              rows={4}
              value={waMsg}
              onChange={(e) => setWaMsg(e.target.value)}
              placeholder="WhatsApp message content..."
              className="w-full bg-cyber-dark/80 border border-cyber-border rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />

            <button
              onClick={handleSendWa}
              disabled={isSendingWa}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
            >
              {isSendingWa ? (
                'Transmitting message...'
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Send WhatsApp Message
                </>
              )}
            </button>

            {waStatus && (
              <div className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{waStatus}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
