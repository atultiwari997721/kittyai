import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  Calendar, 
  ExternalLink, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  BrainCircuit, 
  Clock, 
  RefreshCw,
  Terminal,
  Copy,
  Check
} from 'lucide-react';
import { kittyService } from '../services/kittyService';

export const ChatCopilot = ({ onNavigateToMemory, onNavigateToPlugins }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'ai',
      text: "👋 Hello! I am **KittyAI**, your autonomous personal assistant. Tell me anything you want me to do—from scheduling meetings, executing Windows actions, and fixing code in VS Code, to sending emails and WhatsApp messages.\n\nTry saying: *\"Schedule a meeting for tomorrow and send to the team\"*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      logs: [
        'KittyAI Core initialized',
        'Memory Vault: Active',
        'Autonomous Agents: Ready'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeClarification, setActiveClarification] = useState(null);
  const [clarificationAnswer, setClarificationAnswer] = useState('');
  const [copiedLink, setCopiedLink] = useState(null);
  const [expandedLogs, setExpandedLogs] = useState({});

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeClarification, isLoading]);

  const toggleLog = (msgId) => {
    setExpandedLogs(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleSendMessage = async (textToSend) => {
    const text = typeof textToSend === 'string' ? textToSend : input;
    if (!text.trim() || isLoading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = 'user_' + Date.now();

    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: text.trim(),
        timestamp: timeStr
      }
    ]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await kittyService.processChat(text.trim());
      const aiMsgId = 'ai_' + Date.now();

      if (response.requiresClarification && response.clarificationDetails) {
        setActiveClarification(response.clarificationDetails);
        setMessages(prev => [
          ...prev,
          {
            id: aiMsgId,
            sender: 'ai',
            text: response.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isClarificationPrompt: true,
            clarificationDetails: response.clarificationDetails,
            logs: response.logs
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: aiMsgId,
            sender: 'ai',
            text: response.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            meetingLink: response.meetingLink,
            logs: response.logs
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'ai',
          text: `⚠️ I encountered an error: ${err.message}. Please check your connection or settings.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          logs: ['Error executing task', err.message]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClarificationSubmit = async (e) => {
    e.preventDefault();
    if (!clarificationAnswer.trim() || !activeClarification || isLoading) return;

    const userAns = clarificationAnswer.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = 'user_clarify_' + Date.now();

    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: userAns,
        timestamp: timeStr,
        isClarificationResponse: true
      }
    ]);

    setClarificationAnswer('');
    setIsLoading(true);

    try {
      const response = await kittyService.submitClarification(activeClarification, userAns);
      setActiveClarification(null);

      const aiMsgId = 'ai_resolved_' + Date.now();
      setMessages(prev => [
        ...prev,
        {
          id: aiMsgId,
          sender: 'ai',
          text: response.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          meetingLink: response.meetingLink,
          entityLearned: response.entityLearned,
          logs: response.logs
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'ai',
          text: `⚠️ Failed to save memory: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome_reset',
        sender: 'ai',
        text: "Chat cleared! How can I assist you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        logs: ['Memory session reset']
      }
    ]);
    setActiveClarification(null);
  };

  const samplePrompts = [
    "📅 Schedule a meeting for tomorrow and send to the team",
    "🧠 What do you remember about my team?",
    "✉️ Draft a follow-up email to client",
    "💬 Send WhatsApp message to Alex Johnson",
    "🖥️ Switch Windows theme to dark mode"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto">
      {/* Header bar inside chat */}
      <div className="glass-panel px-5 py-3 rounded-2xl flex items-center justify-between mb-4 border border-white/5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              KittyAI Autonomous Copilot
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Memory Active
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Personal memory learning • Clarification loop • Multi-agent orchestration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition text-xs flex items-center gap-1.5"
            title="Clear Chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 px-2 py-2 pr-3 scroll-smooth">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                  isUser
                    ? 'bg-gradient-to-tr from-indigo-600 to-cyan-600 text-white'
                    : 'bg-gradient-to-tr from-fuchsia-600 to-purple-700 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] md:max-w-[75%] space-y-2`}>
                <div
                  className={`p-4 rounded-2xl shadow-lg ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                      : 'glass-panel text-slate-100 border border-white/10 rounded-tl-none'
                  }`}
                >
                  {/* Entity Learned Banner if applicable */}
                  {msg.entityLearned && (
                    <div className="mb-3 p-2.5 rounded-xl bg-fuchsia-950/80 border border-fuchsia-500/40 flex items-center gap-2 text-xs text-fuchsia-200">
                      <BrainCircuit className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                      <span>
                        Memorized <strong>"{msg.entityLearned}"</strong> into your persistent vault!
                      </span>
                    </div>
                  )}

                  {/* Clarification prompt badge */}
                  {msg.isClarificationPrompt && (
                    <div className="mb-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold">
                      <HelpCircle className="w-3.5 h-3.5" />
                      One-time Entity Clarification
                    </div>
                  )}

                  {/* Message Text with basic markdown rendering */}
                  <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.text.split('\n').map((line, idx) => {
                      // bold text parsing
                      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
                      return (
                        <p key={idx} className="mb-1.5 last:mb-0">
                          {parts.map((p, pIdx) => {
                            if (p.startsWith('**') && p.endsWith('**')) {
                              return <strong key={pIdx} className="font-bold text-white">{p.slice(2, -2)}</strong>;
                            }
                            if (p.startsWith('*') && p.endsWith('*')) {
                              return <em key={pIdx} className="italic text-slate-300">{p.slice(1, -1)}</em>;
                            }
                            return p;
                          })}
                        </p>
                      );
                    })}
                  </div>

                  {/* Meeting Link Action Card if available */}
                  {msg.meetingLink && (
                    <div className="mt-3 p-3 rounded-xl bg-indigo-950/70 border border-indigo-500/40 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span className="text-xs text-indigo-200 truncate font-mono">
                          {msg.meetingLink}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleCopy(msg.meetingLink, msg.id)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-800/80 hover:bg-indigo-700 text-white text-[11px] flex items-center gap-1 transition"
                        >
                          {copiedLink === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy
                            </>
                          )}
                        </button>
                        <a
                          href={msg.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-[11px] flex items-center gap-1 transition font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Join
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5 text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    {msg.logs && (
                      <button
                        onClick={() => toggleLog(msg.id)}
                        className="text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
                      >
                        <Terminal className="w-3 h-3" />
                        <span>{expandedLogs[msg.id] ? 'Hide Logs' : 'View Autonomous Steps'}</span>
                        {expandedLogs[msg.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible Execution Logs */}
                {expandedLogs[msg.id] && msg.logs && (
                  <div className="p-3 rounded-xl bg-black/60 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1 animate-in">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                      Autonomous Execution Trace
                    </div>
                    {msg.logs.map((log, lIdx) => (
                      <div key={lIdx} className="flex items-start gap-1.5">
                        <span className="text-cyan-400">❯</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Active Clarification Form Prompt inside chat */}
        {activeClarification && (
          <div className="my-3 p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 to-purple-950/60 border border-amber-500/40 glass-panel shadow-2xl animate-in">
            <div className="flex items-center gap-2 mb-2 text-amber-300 text-xs font-semibold">
              <HelpCircle className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Entity Resolution Needed for: "{activeClarification.entity}"</span>
            </div>
            <p className="text-xs text-slate-200 mb-3 leading-relaxed">
              {activeClarification.question}
            </p>
            <form onSubmit={handleClarificationSubmit} className="flex gap-2">
              <input
                type="text"
                autoFocus
                value={clarificationAnswer}
                onChange={(e) => setClarificationAnswer(e.target.value)}
                placeholder="e.g. alex@company.com, sarah@company.com, +1-555-0199"
                className="flex-1 bg-black/50 border border-amber-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={isLoading || !clarificationAnswer.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-fuchsia-600 hover:from-amber-400 hover:to-fuchsia-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg transition disabled:opacity-50"
              >
                <span>Save & Continue</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && !activeClarification && (
          <div className="flex items-center gap-3 animate-in">
            <div className="w-8 h-8 rounded-xl bg-fuchsia-600/30 border border-fuchsia-500/40 flex items-center justify-center">
              <Bot className="w-4 h-4 text-fuchsia-400 animate-pulse" />
            </div>
            <div className="p-3.5 rounded-2xl glass-panel border border-white/10 text-xs text-slate-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping"></div>
              <span>KittyAI is analyzing memory, planning actions, and orchestrating tools...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="flex-shrink-0 text-[11px] px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-fuchsia-500/40 text-slate-300 hover:text-white transition whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="mt-2 relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Tell KittyAI: 'Schedule a meeting for tomorrow and send to the team'..."
            className="w-full bg-[#111726]/90 border border-white/10 focus:border-fuchsia-500/60 rounded-2xl pl-4 pr-24 py-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 shadow-xl focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-fuchsia-500/25 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
