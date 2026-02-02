import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Shield, Send, CheckCircle2, AlertCircle, Loader2, Users, Sparkles } from 'lucide-react';

const KittyInstaAi = () => {
    const [followCount, setFollowCount] = useState(25);
    const [status, setStatus] = useState('idle'); 
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [useExistingSession, setUseExistingSession] = useState(true);

    const handleStartAutomation = async (e) => {
        e.preventDefault();
        
        setStatus('processing');
        setProgress(0);
        setMessage('Establishing secure link to Instagram...');

        try {
            const response = await fetch('http://localhost:5003/api/instagram/follow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: '', // Using persistent session
                    password: '',
                    count: followCount,
                    userId: 'default_user'
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Instagram window opened! Please select an account if prompted.');
                simulateProgress();
            } else {
                setMessage(data.error || 'Failed to start automation');
                setStatus('error');
            }
        } catch (error) {
            setMessage('Server unreachable. Please ensure the backend is active.');
            setStatus('error');
        }
    };

    const simulateProgress = () => {
        let current = 0;
        const interval = setInterval(() => {
            current += Math.floor(Math.random() * 3) + 1;
            if (current > 95) current = 95;
            setProgress(current);
            if (status === 'success') {
                setProgress(100);
                clearInterval(interval);
            }
        }, 1000);
    };

    return (
        <div className="min-h-screen pt-28 pb-16 px-4 bg-[#0a0c10] text-white relative overflow-hidden">
            {/* Premium Animated Background */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
            
            <div className="max-w-5xl mx-auto relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
                        <Sparkles className="w-3 h-3" />
                        AI-Powered Growth
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight bg-gradient-to-r from-blue-300 to-purple-700 bg-clip-text text-transparent">
                        KritiInst<span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Ai</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        The most sophisticated Instagram automation agent. <br className="hidden md:block" />
                        Seamlessly scaling your influence using your organic browser sessions.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Feature Cards */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-4 space-y-6"
                    >
                        <div className="p-8 rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-2xl hover:bg-white/[0.05] transition-colors group">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30">
                                <Shield className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Safe Mode</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Our agent uses randomized human pauses and adaptive browsing patterns to stay within natural limits.
                            </p>
                        </div>

                        <div className="p-8 rounded-[32px] bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 backdrop-blur-2xl">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Session Sync</h3>
                            <p className="text-blue-100/70 text-sm leading-relaxed">
                                Automatically detects your logged-in accounts. No need to re-enter sensitive login details.
                            </p>
                        </div>
                    </motion.div>

                    {/* Main Interaction Hub */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-8"
                    >
                        <div className="p-1 w-full bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 rounded-[40px]">
                            <div className="bg-[#0f1115] rounded-[38px] p-8 md:p-12">
                                <form onSubmit={handleStartAutomation} className="space-y-10">
                                    <div className="space-y-8">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-white/5">
                                            <div>
                                                <h4 className="text-lg font-bold mb-1">Target Reach</h4>
                                                <p className="text-slate-500 text-sm">Select how many profiles the AI should engage with.</p>
                                            </div>
                                            <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                                                <Users className="w-5 h-5 text-blue-400" />
                                                <span className="text-2xl font-black text-blue-400">{followCount}</span>
                                            </div>
                                        </div>

                                        <div className="relative pt-4">
                                            <input
                                                type="range"
                                                min="1"
                                                max="500"
                                                value={followCount}
                                                onChange={(e) => setFollowCount(parseInt(e.target.value))}
                                                className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                            />
                                            <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                                <span>Minimum (1)</span>
                                                <span>Standard (250)</span>
                                                <span>Maximum (500)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-3xl flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                <Instagram className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">Use Persistent Session</p>
                                                <p className="text-xs text-slate-500">Fast login with your browser history</p>
                                            </div>
                                        </div>
                                        <div 
                                            onClick={() => setUseExistingSession(!useExistingSession)}
                                            className={`w-14 h-7 rounded-full transition-colors relative cursor-pointer ${useExistingSession ? 'bg-blue-600' : 'bg-white/10'}`}
                                        >
                                            <motion.div 
                                                animate={{ x: useExistingSession ? 28 : 4 }}
                                                className="w-5 h-5 bg-white rounded-full absolute top-1 shadow-xl"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === 'processing'}
                                        className={`w-full group relative py-6 rounded-3xl font-black text-lg overflow-hidden transition-all active:scale-[0.98] ${
                                            status === 'processing' 
                                            ? 'bg-white/5 text-slate-500 cursor-not-allowed' 
                                            : 'bg-white text-black hover:shadow-[0_20px_40px_rgba(59,130,246,0.2)]'
                                        }`}
                                    >
                                        <div className="relative z-10 flex items-center justify-center gap-3">
                                            {status === 'processing' ? (
                                                <><Loader2 className="w-6 h-6 animate-spin" /> Agent Deploying...</>
                                            ) : (
                                                <><Send className="w-6 h-6" /> Deploy Growth Agent</>
                                            )}
                                        </div>
                                        {status !== 'processing' && (
                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                                        )}
                                    </button>
                                </form>

                                <AnimatePresence>
                                    {status !== 'idle' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="mt-12 space-y-6"
                                        >
                                            <div className={`p-5 rounded-[24px] flex items-center gap-4 border ${
                                                status === 'processing' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                                status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                            }`}>
                                                {status === 'processing' && <Loader2 className="w-5 h-5 animate-spin" />}
                                                {status === 'success' && <CheckCircle2 className="w-5 h-5" />}
                                                {status === 'error' && <AlertCircle className="w-5 h-5" />}
                                                <p className="text-sm font-semibold tracking-wide uppercase">{message}</p>
                                            </div>

                                            {status === 'processing' && (
                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-slate-500">
                                                        <span>System Initialization</span>
                                                        <span>{progress}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" 
                                                            style={{ width: `${progress}%` }} 
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default KittyInstaAi;
