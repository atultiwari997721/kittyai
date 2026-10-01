import React, { useState, useEffect } from 'react';
import { 
  X, 
  Laptop, 
  Globe, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Unlink,
  Radio
} from 'lucide-react';
import { kritiService } from '../services/kritiService';

export const PairingModal = ({ isOpen, onClose, onPairingChanged }) => {
  const isDesktopEnv = typeof window !== 'undefined' && (window.__TAURI__ || window.location.port === '9972');
  const [activeTab, setActiveTab] = useState(isDesktopEnv ? 'enter' : 'generate'); // 'generate' | 'enter'
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [copied, setCopied] = useState(false);
  const [pairingState, setPairingState] = useState(kritiService.getPairingState());
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [sidecarOnline, setSidecarOnline] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const state = kritiService.getPairingState();
      setPairingState(state);
      kritiService.checkSidecarHealth().then(setSidecarOnline);
      const isDesk = typeof window !== 'undefined' && (window.__TAURI__ || window.location.port === '9972');
      if (isDesk && !state.paired) {
        setActiveTab('enter');
      } else if (!state.paired && !generatedCode) {
        setActiveTab('generate');
        handleGenerateCode();
      }
    }
  }, [isOpen]);

  const handleGenerateCode = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const isDesktop = typeof window !== 'undefined' && (window.__TAURI__ || window.location.port === '9972');
      const clientType = isDesktop ? 'desktop' : 'web';
      const deviceName = isDesktop ? 'Windows Desktop Kernel' : 'KritiAI Web Client';
      
      const res = await kritiService.generatePairCode(clientType, deviceName);
      if (res.success) {
        setGeneratedCode(res.code);
        setExpiresAt(res.expiresAt);
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: 'Failed to generate code: ' + e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyCode = async (e) => {
    if (e) e.preventDefault();
    if (!inputCode.trim()) return;

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const isDesktop = typeof window !== 'undefined' && (window.__TAURI__ || window.location.port === '9972');
      const clientType = isDesktop ? 'desktop' : 'web';
      const deviceName = isDesktop ? 'Windows Desktop Kernel' : 'KritiAI Web Client';

      const res = await kritiService.verifyPairCode(inputCode.trim(), clientType, deviceName);
      if (res.success) {
        setPairingState(res.state);
        setStatusMessage({ type: 'success', text: res.message });
        if (onPairingChanged) onPairingChanged(res.state);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setStatusMessage({ type: 'error', text: res.message || 'Invalid or expired pairing code.' });
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: e.message || 'Verification failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoPairLocal = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await kritiService.verifyPairCode('LOCAL1', 'web', 'Windows 11 Local Kernel (Port 8000)');
      if (res.success) {
        setPairingState(res.state);
        setStatusMessage({ type: 'success', text: '1-Click Local Link Established!' });
        if (onPairingChanged) onPairingChanged(res.state);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: 'Local link error: ' + e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpair = async () => {
    await kritiService.unpairDevice();
    const newState = { paired: false, code: null, deviceName: null };
    setPairingState(newState);
    setGeneratedCode('');
    setStatusMessage({ type: 'success', text: 'Device successfully unpaired.' });
    if (onPairingChanged) onPairingChanged(newState);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel p-6 rounded-3xl border border-white/10 max-w-lg w-full space-y-5 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-fuchsia-500/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Web & Desktop App Bilateral Pairing</span>
              {pairingState.paired && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Linked
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Connect your deployed Website to your Windows Desktop Kernel using a secure 6-digit code.
            </p>
          </div>
        </div>

        {/* Current Status Box */}
        {pairingState.paired ? (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Connected & Synchronized</span>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                Code: {pairingState.code}
              </span>
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <div><strong>Paired Device:</strong> {pairingState.deviceName || 'Windows Desktop Kernel'}</div>
              <div><strong>Status:</strong> Active (Full Terminal & File Execution Enabled)</div>
            </div>
            <button
              onClick={handleUnpair}
              className="w-full py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center justify-center gap-1.5 transition"
            >
              <Unlink className="w-3.5 h-3.5" />
              <span>Unpair Device</span>
            </button>
          </div>
        ) : (
          <>
            {/* Tabs: Generate Code vs Enter Code */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/40 border border-white/5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('generate')}
                className={`py-2 rounded-xl font-medium transition ${
                  activeTab === 'generate'
                    ? 'bg-fuchsia-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1. Generate 6-Digit Code
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('enter')}
                className={`py-2 rounded-xl font-medium transition ${
                  activeTab === 'enter'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2. Enter 6-Digit Code
              </button>
            </div>

            {/* Tab 1: Generate Code */}
            {activeTab === 'generate' && (
              <div className="space-y-4 text-center p-4 rounded-2xl bg-black/40 border border-white/5">
                <p className="text-xs text-slate-300">
                  Enter this code on your other device (Desktop App or Website) to link them together:
                </p>

                {/* 6-Digit Display */}
                <div className="py-4 px-6 rounded-2xl bg-black/60 border border-fuchsia-500/40 inline-block shadow-inner">
                  <div className="text-3xl font-extrabold font-mono tracking-[0.35em] text-transparent bg-gradient-to-r from-fuchsia-300 via-purple-200 to-indigo-300 bg-clip-text">
                    {generatedCode || '••••••'}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={handleCopyCode}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
                  </button>
                  <button
                    onClick={handleGenerateCode}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-40"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Regenerate</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  ⏱️ Code is valid for 15 minutes. Automatically securely encrypted.
                </p>
              </div>
            )}

            {/* Tab 2: Enter Code */}
            {activeTab === 'enter' && (
              <form onSubmit={handleVerifyCode} className="space-y-4 p-4 rounded-2xl bg-black/40 border border-white/5">
                <label className="text-xs text-slate-300 block font-medium">
                  Enter the 6-Digit Alphanumeric Code shown on your other device:
                </label>

                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="e.g. KR72B9"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    className="w-full text-center text-2xl font-mono tracking-[0.25em] font-extrabold uppercase bg-black/60 border border-white/10 rounded-2xl py-3 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || inputCode.length !== 6}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-40"
                >
                  <Zap className="w-4 h-4" />
                  <span>{isLoading ? 'Verifying Code...' : 'Connect & Link Device'}</span>
                </button>
              </form>
            )}

            {/* Localhost 1-Click Link Shortcut */}
            {sidecarOnline && (
              <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs">
                <div>
                  <div className="text-indigo-200 font-semibold flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Local Windows Kernel Detected (Port 8000)</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Sidecar is running on this machine</div>
                </div>
                <button
                  onClick={handleAutoPairLocal}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] transition shadow"
                >
                  ⚡ 1-Click Link
                </button>
              </div>
            )}
          </>
        )}

        {/* Status Messages */}
        {statusMessage && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Footer info */}
        <div className="text-[11px] text-slate-400 border-t border-white/5 pt-3 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Device Token Pairing</span>
          </span>
          <span className="font-mono text-slate-400">KritiAI OS Protocol v2.5</span>
        </div>
      </div>
    </div>
  );
};
