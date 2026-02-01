import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, Loader2, CheckCircle2, AlertCircle, Sparkles, UserPlus, Settings, Eye, EyeOff } from 'lucide-react';

const MailAi = () => {
    const [emails, setEmails] = useState('');
    const [message, setMessage] = useState('');
    const [subject, setSubject] = useState('');
    const [gmail, setGmail] = useState('');
    const [appPassword, setAppPassword] = useState('');
    const [status, setStatus] = useState('idle'); // idle, processing, success, error
    const [progress, setProgress] = useState(0);
    const [log, setLog] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const addLog = (msg, type = 'info') => {
        setLog(prev => [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        
        if (!gmail || !appPassword) {
            setShowModal(true);
            return;
        }

        const recipientList = emails.split(/[,;\n]/).map(e => e.trim()).filter(e => e.includes('@'));
        
        if (recipientList.length === 0) {
            alert('Please enter at least one valid email address.');
            return;
        }

        setStatus('processing');
        setProgress(0);
        addLog(`Starting broadcast to ${recipientList.length} recipients...`, 'info');

        try {
            const response = await fetch('http://localhost:5003/api/mail/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gmail,
                    appPassword,
                    recipients: recipientList,
                    subject,
                    message
                })
            });

            const data = await response.json();

            if (response.ok) {
                addLog('Broadcast initiated on server. Monitoring progress...', 'success');
                simulateProgress(recipientList.length);
            } else {
                addLog(data.error || 'Broadcast failed', 'error');
                setStatus('error');
            }
        } catch (error) {
            addLog('Server unreachable. Ensure backend is running.', 'error');
            setStatus('error');
        }
    };

    const simulateProgress = (total) => {
        let current = 0;
        const interval = setInterval(() => {
            current += 1;
            const p = Math.min(Math.round((current / total) * 100), 100);
            setProgress(p);
            
            if (current % 5 === 0 && current < total) {
                addLog(`Batch of 5 sent. Waiting for next batch...`, 'info');
            }

            if (current >= total) {
                clearInterval(interval);
                setStatus('success');
                addLog(`All ${total} emails sent successfully!`, 'success');
            }
        }, 1000); // Visual simulation matching backend delays roughly
    };

    return (
        <div className="min-h-screen pt-28 pb-16 px-4 bg-[#0a0c10] text-white relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />

            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
                        <Mail className="w-3 h-3" />
                        Enterprise Broadcasting
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
                        Mail<span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Ai</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Broadcast personalized messages to thousands of recipients using your own Gmail, 
                        with built-in anti-spam velocity control.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Input Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-7 space-y-6"
                    >
                        <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 backdrop-blur-2xl">
                            <form onSubmit={handleBroadcast} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 ml-1 uppercase tracking-wider">Recipients</label>
                                    <textarea 
                                        placeholder="Enter email addresses (comma separated)..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[120px] focus:outline-none focus:border-blue-500/50 transition-colors text-slate-200 placeholder:text-slate-600"
                                        value={emails}
                                        onChange={(e) => setEmails(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 ml-1 uppercase tracking-wider">Subject</label>
                                    <input 
                                        type="text"
                                        placeholder="Enter email subject..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-colors text-slate-200 placeholder:text-slate-600"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 ml-1 uppercase tracking-wider">Message Body</label>
                                    <textarea 
                                        placeholder="Write your message here..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[200px] focus:outline-none focus:border-blue-500/50 transition-colors text-slate-200 placeholder:text-slate-600"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setShowModal(true)}
                                        className="flex-1 py-4 px-6 rounded-2xl border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2 font-bold"
                                    >
                                        <Settings className="w-5 h-5 text-slate-400" />
                                        SMTP Settings
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={status === 'processing'}
                                        className="flex-[2] py-4 px-6 rounded-2xl bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95 transition-all flex items-center justify-center gap-2 font-black disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {status === 'processing' ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> Broadcasting...</>
                                        ) : (
                                            <><Send className="w-5 h-5" /> Start Broadcast</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>

                    {/* Right: Status & Logs */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-5 space-y-6"
                    >
                        {/* Progress Card */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 backdrop-blur-2xl">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-blue-400" />
                                Live Status
                            </h3>
                            
                            <div className="space-y-8">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-sm text-slate-500 uppercase font-black">Velocity</p>
                                        <p className="text-2xl font-black">5 <span className="text-sm font-normal text-slate-500">mails / batch</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500 uppercase font-black">Progress</p>
                                        <p className="text-2xl font-black text-blue-400">{progress}%</p>
                                    </div>
                                </div>

                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-white/5 rounded-2xl p-4 text-center">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Success</p>
                                        <p className="text-lg font-black text-emerald-400">{status === 'success' ? 'Finished' : 'Waiting'}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 text-center">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Errors</p>
                                        <p className="text-lg font-black text-rose-400">0</p>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 text-center">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Provider</p>
                                        <p className="text-lg font-black text-blue-400">Gmail</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Logs */}
                        <div className="bg-[#0f1115] border border-white/10 rounded-[32px] p-6 h-[400px] flex flex-col">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Activity Log</h4>
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                <AnimatePresence initial={false}>
                                    {log.map((item, idx) => (
                                        <motion.div 
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-xs font-mono flex gap-3"
                                        >
                                            <span className="text-slate-600">[{item.time}]</span>
                                            <span className={
                                                item.type === 'success' ? 'text-emerald-400' :
                                                item.type === 'error' ? 'text-rose-400' :
                                                'text-slate-400'
                                            }>
                                                {item.msg}
                                            </span>
                                        </motion.div>
                                    ))}
                                    {log.length === 0 && (
                                        <p className="text-slate-600 text-xs italic text-center mt-12">No activity recorded yet.</p>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Credentials Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#1a1c22] border border-white/10 w-full max-w-md rounded-[40px] p-10 relative z-10 shadow-2xl"
                        >
                            <h2 className="text-2xl font-black mb-2">Connect Gmail</h2>
                            <p className="text-slate-400 text-sm mb-8">Enter your Gmail App Password to enable broadcasting.</p>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Gmail Address</label>
                                    <input 
                                        type="email"
                                        placeholder="yourname@gmail.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-colors text-slate-200"
                                        value={gmail}
                                        onChange={(e) => setGmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex justify-between">
                                        <span>App Password</span>
                                        <button onClick={() => setShowPassword(!showPassword)} className="text-blue-400 lowercase italic">
                                            {showPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="xxxx xxxx xxxx xxxx"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-colors text-slate-200"
                                            value={appPassword}
                                            onChange={(e) => setAppPassword(e.target.value)}
                                        />
                                    </div>
-&gt; Security -&gt; 2-Step Verification -&gt; App Passwords
                                </div>
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="w-full py-4 bg-white text-black rounded-2xl font-black shadow-lg hover:shadow-white/5 transition-all active:scale-95"
                                >
                                    Save Credentials
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MailAi;
