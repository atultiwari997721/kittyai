import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import { io } from 'socket.io-client';
import { MessageSquare, Send, RefreshCw, Smartphone, CheckCircle, AlertCircle, Terminal } from 'lucide-react';

const WhatsAppSender = () => {
    const [socket, setSocket] = useState(null);
    const [status, setStatus] = useState('disconnected');
    const [qrCode, setQrCode] = useState('');
    const [logs, setLogs] = useState([]);
    const [message, setMessage] = useState('');
    const [numbers, setNumbers] = useState('');
    const logsEndRef = useRef(null);

    useEffect(() => {
        // Connect to backend
        const newSocket = io('http://localhost:5003');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket connected');
        });

        newSocket.on('qr', (qr) => {
            setQrCode(qr);
            setStatus('waiting_for_scan');
        });

        newSocket.on('ready', () => {
            setStatus('connected');
            setQrCode('');
        });

        newSocket.on('status', (s) => {
            setStatus(s);
            if (s === 'connected' || s === 'authenticated') {
                setQrCode('');
            }
        });

        newSocket.on('log', (log) => {
            setLogs(prev => [...prev, { ...log, timestamp: new Date().toLocaleTimeString() }]);
        });

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleSend = () => {
        if (!socket || status !== 'connected') return;

        const numberList = numbers.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length > 0);
        
        if (numberList.length === 0) {
            alert('Please enter at least one phone number.');
            return;
        }
        if (!message.trim()) {
            alert('Please enter a message.');
            return;
        }

        socket.emit('send_bulk', { message, numbers: numberList });
        setLogs(prev => [...prev, { type: 'info', message: `Starting bulk send to ${numberList.length} numbers...`, timestamp: new Date().toLocaleTimeString() }]);
    };

    const handleLogout = () => {
        if(socket) socket.emit('logout');
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <MessageSquare className="w-8 h-8 text-green-600" />
                    WhatsApp Bulk Sender
                </h1>
                <p className="text-slate-500 mt-2">Connect your WhatsApp and send messages to multiple contacts automatically.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Connection Status */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Smartphone className="w-5 h-5" /> Connection
                    </h2>

                    <div className="flex flex-col items-center justify-center min-h-[300px] bg-slate-50 rounded-xl border border-slate-100 p-6">
                        {status === 'disconnected' && (
                            <div className="text-center text-slate-500">
                                <RefreshCw className="w-12 h-12 mx-auto mb-3 animate-spin opacity-50" />
                                <p>Connecting to server...</p>
                            </div>
                        )}
                        
                        {status === 'waiting_for_scan' && qrCode && (
                            <div className="text-center">
                                <div className="bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">
                                    <QRCode value={qrCode} size={200} />
                                </div>
                                <p className="text-sm text-slate-600 font-medium">Scan with WhatsApp</p>
                                <p className="text-xs text-slate-400 mt-1">Open WhatsApp {'>'} Linked Devices {'>'} Link a Device</p>
                            </div>
                        )}

                        {status === 'connected' && (
                            <div className="text-center text-green-600">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-10 h-10" />
                                </div>
                                <p className="font-bold text-lg">WhatsApp Connected</p>
                                <button 
                                    onClick={handleLogout}
                                    className="mt-6 text-sm text-red-500 hover:text-red-700 underline"
                                >
                                    Logout & Disconnect
                                </button>
                            </div>
                        )}
                        
                        {status === 'auth_failure' && (
                             <div className="text-center text-red-500">
                                <AlertCircle className="w-12 h-12 mx-auto mb-3" />
                                <p>Authentication Failed</p>
                                <p className="text-xs mt-2">Please refresh the page and try again.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle Column: Composer */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Send className="w-5 h-5" /> Compose
                    </h2>

                    <div className="space-y-4 flex-1">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
                                placeholder="Type your message here..."
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Phone Numbers <span className="text-xs text-slate-400 font-normal">(One per line or comma separated)</span>
                            </label>
                            <textarea
                                value={numbers}
                                onChange={(e) => setNumbers(e.target.value)}
                                className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition font-mono text-sm"
                                placeholder="919876543210&#10;911234567890"
                            ></textarea>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleSend}
                                disabled={status !== 'connected'}
                                className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2
                                    ${status === 'connected' 
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-green-500/25 active:scale-[0.98]' 
                                        : 'bg-slate-300 cursor-not-allowed'}
                                `}
                            >
                                <Send className="w-5 h-5" />
                                Send Bulk Message
                            </button>
                        </div>
                    </div>
                </div>
            </div>

             {/* Bottom Row: Logs */}
             <div className="mt-8 bg-slate-900 rounded-2xl p-6 shadow-lg text-slate-300 font-mono text-sm">
                <h3 className="flex items-center gap-2 text-white font-semibold mb-4 border-b border-slate-800 pb-3">
                    <Terminal className="w-4 h-4" /> Activity Log
                </h3>
                <div className="h-48 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                    {logs.length === 0 && <p className="text-slate-600 italic">No activity yet...</p>}
                    {logs.map((log, i) => (
                        <div key={i} className={`flex gap-3 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-slate-300'}`}>
                            <span className="text-slate-600 select-none">[{log.timestamp}]</span>
                            <span>{log.message}</span>
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
            </div>
        </div>
    );
};

export default WhatsAppSender;
