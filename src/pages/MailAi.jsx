import React, { useState } from 'react';

const MailAi = () => {
    const [senderEmail, setSenderEmail] = useState('');
    const [recipients, setRecipients] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const handleConnect = async () => {
        setIsLoading(true);
        setStatus('Launching Gmail Agent...');
        try {
            const res = await fetch('http://localhost:5003/api/mail/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ senderEmail })
            });
            const data = await res.json();
            if (res.ok) {
                setStatus('Agent Ready. Please login in the opened browser if needed.');
                setIsConnected(true);
            } else {
                setStatus(`Error: ${data.error}`);
            }
        } catch (err) {
            setStatus('Failed to connect to backend: ' + err.message);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBroadcast = async () => {
        if (!recipients || !message) {
            setStatus('Please fill in recipients and message.');
            return;
        }

        setIsLoading(true);
        setStatus('Starting Broadcast...');
        try {
            const res = await fetch('http://localhost:5003/api/mail/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    recipients: recipients, 
                    subject, 
                    message, 
                    senderEmail 
                })
            });
            const data = await res.json();
            if (res.ok) {
                setStatus(`Broadcast Started: ${data.message}`);
            } else {
                setStatus(`Error: ${data.error}`);
            }
        } catch (err) {
            setStatus('Failed to send request: ' + err.message);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-800 rounded-xl shadow-2xl p-6 border border-slate-700">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2 text-blue-400">Mail AI</h1>
                    <p className="text-slate-400 text-sm">Automated Gmail Broadcasting Agent</p>
                </div>

                {/* Connection Section */}
                <div className="mb-6 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        Sender Identity
                    </label>
                    <input 
                        type="email" 
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors mb-3"
                        placeholder="your.email@gmail.com (Optional)"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                    />
                    <button 
                        onClick={handleConnect}
                        disabled={isLoading}
                        className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                            isLoading ? 'bg-slate-700 cursor-not-allowed' :
                            isConnected ? 'bg-green-600 hover:bg-green-700' : 
                            'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {isLoading && !isConnected ? 'Connecting...' : 
                         isConnected ? '✓ Agent Active' : 'Login / Open Session'}
                    </button>
                </div>

                {/* Compose Section */}
                <div className="space-y-4">
                     <label className="block text-xs font-bold text-slate-500 uppercase">
                        Compose Broadcast
                    </label>
                    
                    <input 
                        type="text" 
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Subject Line"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />

                    <textarea 
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors h-24 resize-y"
                        placeholder="Recipients (comma separated)..."
                        value={recipients}
                        onChange={(e) => setRecipients(e.target.value)}
                    />

                    <textarea 
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors h-32 resize-y"
                        placeholder="Message body..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />

                    <button 
                        onClick={handleBroadcast}
                        disabled={isLoading}
                        className={`w-full py-4 rounded-xl font-bold shadow-lg transform active:scale-95 transition-all text-white ${
                            isLoading ? 'bg-indigo-900 cursor-wait' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                        }`}
                    >
                         {isLoading ? 'Processing...' : 'Send Broadcast'}
                    </button>
                </div>

                {/* Status Console */}
                {status && (
                    <div className="mt-6 p-4 bg-black rounded-lg border border-slate-800 font-mono text-xs overflow-x-auto">
                        <span className="text-green-400">{'>'} {status}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MailAi;
