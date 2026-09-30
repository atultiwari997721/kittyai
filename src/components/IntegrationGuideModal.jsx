import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Globe, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Key, 
  Layers, 
  Terminal,
  ChevronRight,
  HelpCircle,
  QrCode
} from 'lucide-react';
import { kritiService } from '../services/kritiService';

export const IntegrationGuideModal = ({ isOpen, onClose, initialService = 'gmail' }) => {
  const [activeTab, setActiveTab] = useState(initialService); // 'gmail' | 'whatsapp' | 'calendar' | 'vscode'
  const [gmailMethod, setGmailMethod] = useState('app_password'); // 'app_password' | 'oauth'
  const [waMethod, setWaMethod] = useState('qr_bridge'); // 'qr_bridge' | 'meta_cloud' | 'twilio'
  const [copiedText, setCopiedText] = useState(null);

  // Live test states
  const [testEmailUser, setTestEmailUser] = useState('');
  const [testEmailPass, setTestEmailPass] = useState('');
  const [emailStatus, setEmailStatus] = useState(null);

  const [waPhoneTest, setWaPhoneTest] = useState('+91-98765-43210');
  const [waStatus, setWaStatus] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSaveAppPassword = (e) => {
    e.preventDefault();
    if (!testEmailUser || !testEmailPass) return;
    kritiService.saveMemory('gmail_app_credentials', {
      email: testEmailUser.trim(),
      appPassword: testEmailPass.trim(),
      authType: 'app_password'
    }, 'credentials');
    setEmailStatus({
      type: 'success',
      text: 'Gmail App Password safely saved in your client Memory Vault! Ready for sending emails.'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel p-6 rounded-3xl border border-white/10 max-w-2xl w-full space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Integration Guides & Service Setup</h2>
            <p className="text-xs text-slate-400">
              Step-by-step instructions to connect Gmail, WhatsApp, Google Calendar, and VS Code.
            </p>
          </div>
        </div>

        {/* Service Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-white/5 pb-2 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('gmail')}
            className={`px-3.5 py-2 rounded-xl font-medium flex items-center gap-1.5 transition ${
              activeTab === 'gmail'
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Gmail / Email</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-3.5 py-2 rounded-xl font-medium flex items-center gap-1.5 transition ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3.5 py-2 rounded-xl font-medium flex items-center gap-1.5 transition ${
              activeTab === 'calendar'
                ? 'bg-sky-600/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Google Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('vscode')}
            className={`px-3.5 py-2 rounded-xl font-medium flex items-center gap-1.5 transition ${
              activeTab === 'vscode'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>VS Code & Terminal</span>
          </button>
        </div>

        {/* ================= GMAIL TAB ================= */}
        {activeTab === 'gmail' && (
          <div className="space-y-4 text-xs">
            {/* Method Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/40 border border-white/5">
              <button
                type="button"
                onClick={() => setGmailMethod('app_password')}
                className={`py-1.5 rounded-lg font-medium transition ${
                  gmailMethod === 'app_password' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Method 1: Google App Password (Fastest • 2 Mins)
              </button>
              <button
                type="button"
                onClick={() => setGmailMethod('oauth')}
                className={`py-1.5 rounded-lg font-medium transition ${
                  gmailMethod === 'oauth' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Method 2: Google Cloud OAuth 2.0
              </button>
            </div>

            {gmailMethod === 'app_password' ? (
              <div className="space-y-3 p-4 rounded-2xl bg-black/30 border border-white/5">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>How to generate a Gmail App Password in 2 minutes:</span>
                </div>

                <ol className="space-y-2 text-slate-300 list-decimal list-inside leading-relaxed">
                  <li>
                    Log in to your Google Account and ensure <strong>2-Step Verification</strong> is enabled at{' '}
                    <a 
                      href="https://myaccount.google.com/security" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-rose-400 hover:underline inline-flex items-center gap-0.5"
                    >
                      myaccount.google.com/security <ExternalLink className="w-3 h-3" />
                    </a>.
                  </li>
                  <li>
                    Navigate directly to Google App Passwords:{' '}
                    <a 
                      href="https://myaccount.google.com/apppasswords" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-rose-400 hover:underline inline-flex items-center gap-0.5"
                    >
                      myaccount.google.com/apppasswords <ExternalLink className="w-3 h-3" />
                    </a>.
                  </li>
                  <li>Enter app name <strong>KritiAI</strong> and click <strong>Create</strong>.</li>
                  <li>Google will give you a <strong>16-character password</strong> (e.g. <code className="bg-black/60 px-1 py-0.5 rounded text-rose-300 font-mono">abcd efgh ijkl mnop</code>).</li>
                  <li>Paste your Gmail and the 16-character password below to link immediately:</li>
                </ol>

                <form onSubmit={handleSaveAppPassword} className="space-y-2 pt-2 border-t border-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1">Your Gmail Address</label>
                      <input
                        type="email"
                        required
                        placeholder="you@gmail.com"
                        value={testEmailUser}
                        onChange={(e) => setTestEmailUser(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">16-Character App Password</label>
                      <input
                        type="password"
                        required
                        placeholder="abcd efgh ijkl mnop"
                        value={testEmailPass}
                        onChange={(e) => setTestEmailPass(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-lg transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save & Authorize Gmail Dispatch</span>
                  </button>
                </form>

                {emailStatus && (
                  <div className={`p-2.5 rounded-xl flex items-center gap-2 ${
                    emailStatus.type === 'success' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{emailStatus.text}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 p-4 rounded-2xl bg-black/30 border border-white/5">
                <div className="font-semibold text-white">Google Cloud Console OAuth 2.0 Walkthrough:</div>
                <ol className="space-y-2 text-slate-300 list-decimal list-inside leading-relaxed">
                  <li>
                    Go to{' '}
                    <a 
                      href="https://console.cloud.google.com" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-indigo-400 hover:underline inline-flex items-center gap-0.5"
                    >
                      Google Cloud Console <ExternalLink className="w-3 h-3" />
                    </a> and create a new project.
                  </li>
                  <li>Under <strong>APIs & Services ➔ Library</strong>, enable <strong>Gmail API</strong>.</li>
                  <li>Configure <strong>OAuth consent screen</strong> with User Type: <em>External</em>.</li>
                  <li>
                    Add scope: <code className="bg-black/60 px-1 py-0.5 rounded text-indigo-300 font-mono">https://www.googleapis.com/auth/gmail.send</code>
                  </li>
                  <li>
                    Go to <strong>Credentials ➔ Create Credentials ➔ OAuth Client ID</strong> (Web Application).
                  </li>
                  <li>
                    Set Authorized redirect URI to:{' '}
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-black/60 px-2 py-1 rounded text-white font-mono flex-1">
                        http://localhost:9972/api/auth/google/callback
                      </code>
                      <button
                        onClick={() => handleCopy('http://localhost:9972/api/auth/google/callback', 'oauth_uri')}
                        className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200"
                      >
                        {copiedText === 'oauth_uri' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </li>
                  <li>Copy your Client ID and enter it in Plugins ➔ Google Workspace.</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* ================= WHATSAPP TAB ================= */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-black/40 border border-white/5">
              <button
                type="button"
                onClick={() => setWaMethod('qr_bridge')}
                className={`py-1.5 rounded-lg font-medium transition ${
                  waMethod === 'qr_bridge' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                1. QR Code Web Bridge
              </button>
              <button
                type="button"
                onClick={() => setWaMethod('meta_cloud')}
                className={`py-1.5 rounded-lg font-medium transition ${
                  waMethod === 'meta_cloud' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                2. Meta Cloud API
              </button>
              <button
                type="button"
                onClick={() => setWaMethod('twilio')}
                className={`py-1.5 rounded-lg font-medium transition ${
                  waMethod === 'twilio' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                3. Twilio API
              </button>
            </div>

            {waMethod === 'qr_bridge' && (
              <div className="space-y-3 p-4 rounded-2xl bg-black/30 border border-white/5">
                <div className="font-semibold text-white flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span>Scan QR Code with WhatsApp Mobile (Instant Connection):</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/50 border border-emerald-500/20 flex flex-col items-center justify-center space-y-3 text-center">
                  <div className="w-40 h-40 bg-white p-2.5 rounded-2xl shadow-xl flex items-center justify-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://whatsapp.com/dl/code?kritiai=${encodeURIComponent(kritiService.getPairingState().code || 'KR72B9')}`}
                      alt="WhatsApp Web QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Point your camera at this QR code via <strong>WhatsApp ➔ Linked Devices ➔ Link a Device</strong>
                  </div>
                </div>

                <ol className="space-y-1.5 text-slate-300 list-decimal list-inside leading-relaxed">
                  <li>Open <strong>WhatsApp</strong> on your phone.</li>
                  <li>Tap <strong>Menu (3 dots)</strong> or <strong>Settings ➔ Linked Devices</strong>.</li>
                  <li>Tap <strong>Link a Device</strong> and point your phone at the QR code above.</li>
                  <li>Once scanned, KritiAI is authorized to send team sync alerts and meeting links!</li>
                </ol>
              </div>
            )}

            {waMethod === 'meta_cloud' && (
              <div className="space-y-3 p-4 rounded-2xl bg-black/30 border border-white/5">
                <div className="font-semibold text-white">Meta WhatsApp Cloud API (Production Business):</div>
                <ol className="space-y-2 text-slate-300 list-decimal list-inside leading-relaxed">
                  <li>
                    Visit{' '}
                    <a 
                      href="https://developers.facebook.com" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                    >
                      Meta for Developers <ExternalLink className="w-3 h-3" />
                    </a> and create an app with Type: <strong>Business</strong>.
                  </li>
                  <li>Add the <strong>WhatsApp</strong> product to your app.</li>
                  <li>From the API Setup page, copy your <strong>Permanent Access Token</strong> and <strong>Phone Number ID</strong>.</li>
                  <li>Store them in your Personal Memory Vault or Sidecar configuration.</li>
                </ol>
              </div>
            )}

            {waMethod === 'twilio' && (
              <div className="space-y-3 p-4 rounded-2xl bg-black/30 border border-white/5">
                <div className="font-semibold text-white">Twilio WhatsApp Sandbox Setup:</div>
                <ol className="space-y-2 text-slate-300 list-decimal list-inside leading-relaxed">
                  <li>Sign up at <a href="https://www.twilio.com" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">twilio.com</a>.</li>
                  <li>Navigate to <strong>Messaging ➔ Try it Out ➔ Send a WhatsApp message</strong>.</li>
                  <li>Copy your <strong>Account SID</strong> and <strong>Auth Token</strong> into sidecar settings.</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* ================= CALENDAR TAB ================= */}
        {activeTab === 'calendar' && (
          <div className="space-y-3 p-4 rounded-2xl bg-black/30 border border-white/5 text-xs">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>Google Calendar Sync Instructions:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              When enabled, KritiAI checks your Google Calendar for schedule conflicts, automatically books calendar events, and generates dedicated Google Meet URLs.
            </p>
            <ol className="space-y-2 text-slate-300 list-decimal list-inside leading-relaxed">
              <li>Open Google Cloud Console and ensure <strong>Google Calendar API</strong> is enabled.</li>
              <li>Add scope: <code className="bg-black/60 px-1 py-0.5 rounded text-sky-300 font-mono">https://www.googleapis.com/auth/calendar.events</code></li>
              <li>Events created by KritiAI will appear instantly in your Google Calendar mobile app and web app!</li>
            </ol>
          </div>
        )}

        {/* ================= VS CODE TAB ================= */}
        {activeTab === 'vscode' && (
          <div className="space-y-3 p-4 rounded-2xl bg-black/30 border border-white/5 text-xs">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>VS Code & Windows Terminal Integration:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              KritiAI has direct kernel access to your Windows terminal, PowerShell, and VS Code CLI:
            </p>
            <ol className="space-y-2 text-slate-300 list-decimal list-inside leading-relaxed">
              <li>
                Ensure VS Code CLI is in your system path by opening VS Code, pressing <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">Ctrl+Shift+P</kbd>, and selecting <strong>Shell Command: Install 'code' command in PATH</strong>.
              </li>
              <li>
                In the new <strong>Terminal & Code</strong> tab in KritiAI, you can execute any command like <code className="bg-black/60 px-1 py-0.5 rounded text-purple-300 font-mono">code .</code>, <code className="bg-black/60 px-1 py-0.5 rounded text-purple-300 font-mono">npm test</code>, or <code className="bg-black/60 px-1 py-0.5 rounded text-purple-300 font-mono">dir</code>.
              </li>
              <li>
                You can also ask KritiAI: <em>"Create a file auth.py with code and run it"</em> and it will execute on your machine!
              </li>
            </ol>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-white/5 pt-3 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>All personal credentials stay in your local browser storage & sidecar.</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
