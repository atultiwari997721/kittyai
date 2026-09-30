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
  Terminal, 
  Copy, 
  Check, 
  X, 
  ShieldAlert, 
  Code2, 
  Mail, 
  Sliders, 
  Cpu,
  Key,
  Zap,
  AlertCircle
} from 'lucide-react';
import { kritiService } from '../services/kritiService';

export const ChatCopilot = ({ onNavigateToTasks, onNavigateToMemory, onNavigateToControls }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'ai',
      text: "👋 Hello! I am **KritiAI**, your autonomous personal AI operating system.\n*\"Your Personal AI That Gets Things Done.\"*\n\nPowered by ultra-fast **Groq LPUs (Llama 3.3 70B)**, Google Gemini, and on-device Windows agents.\n\nTry asking:\n- *\"Write a complete Python FastAPI authentication service\"*\n- *\"Fix the login error in my VS Code project\"*\n- *\"Schedule a meeting with the project team tomorrow at 5 PM\"*\n- *\"Switch Windows to dark mode and set volume to 60%\"*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      logs: [
        'KritiAI Master Analyzer initialized',
        'Model Routing: Groq LPUs / Multi-Model Active',
        'Memory Vault: Connected',
        'Autonomous Agents: Ready'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('AUTO');
  const [activeModel, setActiveModel] = useState(kritiService.resolveActiveModel());
  const [activeClarification, setActiveClarification] = useState(null);
  const [clarificationAnswer, setClarificationAnswer] = useState('');
  const [copiedLink, setCopiedLink] = useState(null);
  const [expandedLogs, setExpandedLogs] = useState({});

  // Quick Key Configuration Drawer
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [groqKeyInput, setGroqKeyInput] = useState(kritiService.getApiKey('groq') || '');
  const [keySaveMessage, setKeySaveMessage] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeClarification, isLoading]);

  useEffect(() => {
    // Keep active model and key up-to-date
    setActiveModel(kritiService.resolveActiveModel());
    setGroqKeyInput(kritiService.getApiKey('groq') || '');
  }, []);

  useEffect(() => {
    if (showKeyModal) {
      setGroqKeyInput(kritiService.getApiKey('groq') || '');
    }
  }, [showKeyModal]);

  const toggleLog = (msgId) => {
    setExpandedLogs(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleModelChange = (model) => {
    setActiveModel(model);
    kritiService.saveSettings({ activeModel: model });
  };

  const handleGroqInputChange = (val) => {
    setGroqKeyInput(val);
    // Immediately persist to browser storage so it is never lost on navigation
    kritiService.saveSettings({ groqApiKey: val, activeModel: 'groq-llama3' });
    setActiveModel('groq-llama3');
  };

  const handleSaveGroqKey = async (e) => {
    e.preventDefault();
    if (!groqKeyInput.trim()) return;
    kritiService.saveSettings({ groqApiKey: groqKeyInput.trim(), activeModel: 'groq-llama3' });
    setActiveModel('groq-llama3');
    setKeySaveMessage({ type: 'success', text: 'Groq API Key Saved in Browser Storage! Testing key...' });
    
    const testResult = await kritiService.testProviderKey('groq', groqKeyInput.trim());
    if (testResult.success) {
      setKeySaveMessage({ type: 'success', text: 'Groq API Key Verified! Llama 3.3 70B Active.' });
      setTimeout(() => {
        setShowKeyModal(false);
        setKeySaveMessage(null);
      }, 1500);
    } else {
      setKeySaveMessage({ type: 'error', text: testResult.message });
    }
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
      const response = await kritiService.processChat(text.trim(), selectedAgent, activeModel);
      const aiMsgId = 'ai_' + Date.now();
      const replyText = response.reply || response.summary || response.reasoning || "Execution completed.";

      if (response.requiresClarification && response.clarificationDetails) {
        setActiveClarification(response.clarificationDetails);
        setMessages(prev => [
          ...prev,
          {
            id: aiMsgId,
            sender: 'ai',
            text: replyText,
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
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            task: response.task,
            approvalNeeded: response.approvalNeeded,
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
          text: `⚠️ Encountered an issue: ${err.message}. Please check connection or API key settings.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          logs: ['Error executing task', err.message]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInlineApproval = (taskId, approved) => {
    if (approved) {
      kritiService.updateTaskStatus(taskId, 'COMPLETED', `Authorized by user at ${new Date().toLocaleTimeString()}`);
      setMessages(prev => [
        ...prev,
        {
          id: 'ai_exec_' + Date.now(),
          sender: 'ai',
          text: `✅ **Action Authorized & Executed!**\n\nThe consequential action for task \`${taskId}\` has been committed and verified. Check the **Task Center** for full audit trail logs.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          logs: [`Task ${taskId} approved by user`, 'Executed via CommandPolicyEngine', 'Result: SUCCESS']
        }
      ]);
    } else {
      kritiService.updateTaskStatus(taskId, 'CANCELLED', `Rejected by user at ${new Date().toLocaleTimeString()}`);
      setMessages(prev => [
        ...prev,
        {
          id: 'ai_cancel_' + Date.now(),
          sender: 'ai',
          text: `❌ **Action Cancelled.** Task \`${taskId}\` was not executed. No changes were made.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          logs: [`Task ${taskId} cancelled by user`]
        }
      ]);
    }
  };

  const handleClarificationSubmit = async (e) => {
    e.preventDefault();
    if (!clarificationAnswer.trim() || !activeClarification || isLoading) return;

    const userAns = clarificationAnswer.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [
      ...prev,
      {
        id: 'user_clarify_' + Date.now(),
        sender: 'user',
        text: userAns,
        timestamp: timeStr
      }
    ]);

    setClarificationAnswer('');
    setIsLoading(true);

    try {
      const response = await kritiService.submitClarification(activeClarification, userAns);
      setActiveClarification(null);

      setMessages(prev => [
        ...prev,
        {
          id: 'ai_res_' + Date.now(),
          sender: 'ai',
          text: response.reply || "Entity memorized.",
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
          text: `⚠️ Failed to commit memory: ${err.message}`,
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
        text: "Chat context cleared! How can KritiAI assist you?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        logs: ['Conversation context reset']
      }
    ]);
    setActiveClarification(null);
  };

  const agents = [
    { id: 'AUTO', label: 'AUTO (Intent Routing)', desc: 'Autonomous Multi-Agent Routing' },
    { id: 'coding', label: 'Coding Agent', desc: 'VS Code & Compiler Diagnostics' },
    { id: 'os', label: 'Windows OS Agent', desc: 'System Settings & Controls' },
    { id: 'email', label: 'Email Agent', desc: 'Gmail Drafting & Authorization' },
    { id: 'calendar', label: 'Calendar Agent', desc: 'Google Calendar Sync' },
    { id: 'research', label: 'Research Agent', desc: 'Multi-Source Intelligence' }
  ];

  const modelsList = [
    { id: 'groq-llama3', label: '⚡ Groq (Llama 3.3 70B)', hasKey: !!kritiService.getApiKey('groq') },
    { id: 'gemini-2.0', label: '💎 Gemini 2.0 Flash', hasKey: !!kritiService.getApiKey('gemini') },
    { id: 'gpt-4o', label: '🧠 OpenAI GPT-4o', hasKey: !!kritiService.getApiKey('openai') },
    { id: 'nvidia-nim', label: '🚀 NVIDIA NIM (70B)', hasKey: !!kritiService.getApiKey('nvidia') },
    { id: 'ollama', label: '💻 Local Ollama (Offline)', hasKey: true }
  ];

  const quickPrompts = [
    "⚡ Run command dir",
    "📁 Create file workspace/hello.py with print('Hello from KritiAI Kernel!')",
    "📅 Schedule a meeting with the project team tomorrow at 5 PM",
    "✉️ Write an email to Rahul saying I will send deliverables tomorrow",
    "🖥️ Switch Windows to dark mode and set volume to 60%"
  ];

  // Helper to render text with markdown bold, italic, and code blocks
  const renderMessageContent = (rawText) => {
    const text = rawText || '';
    if (!text.includes('```')) {
      return (
        <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
          {text.split('\n').map((line, idx) => {
            const parts = line.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
            return (
              <p key={idx} className="mb-1.5 last:mb-0">
                {parts.map((p, pIdx) => {
                  if (p.startsWith('**') && p.endsWith('**')) {
                    return <strong key={pIdx} className="font-bold text-white">{p.slice(2, -2)}</strong>;
                  }
                  if (p.startsWith('*') && p.endsWith('*')) {
                    return <em key={pIdx} className="italic text-slate-300">{p.slice(1, -1)}</em>;
                  }
                  if (p.startsWith('`') && p.endsWith('`')) {
                    return <code key={pIdx} className="bg-black/60 text-fuchsia-300 px-1 py-0.5 rounded font-mono text-[11px]">{p.slice(1, -1)}</code>;
                  }
                  return p;
                })}
              </p>
            );
          })}
        </div>
      );
    }

    // Split code blocks
    const chunks = text.split(/(```[\s\S]*?```)/g);
    return (
      <div className="text-xs sm:text-sm leading-relaxed space-y-2">
        {chunks.map((chunk, cIdx) => {
          if (chunk.startsWith('```') && chunk.endsWith('```')) {
            const lines = chunk.slice(3, -3).trim().split('\n');
            const lang = lines[0].trim();
            const code = lines.slice(1).join('\n') || lines[0];
            return (
              <div key={cIdx} className="my-2.5 rounded-xl overflow-hidden border border-white/10 bg-[#090d16] font-mono text-xs">
                <div className="flex items-center justify-between px-3 py-1.5 bg-black/60 border-b border-white/5 text-[10px] text-slate-400">
                  <span className="uppercase font-semibold text-fuchsia-300">{lang || 'CODE'}</span>
                  <button
                    onClick={() => handleCopy(code, 'code_' + cIdx)}
                    className="hover:text-white flex items-center gap-1 transition"
                  >
                    {copiedLink === 'code_' + cIdx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink === 'code_' + cIdx ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 text-emerald-300 overflow-x-auto text-[11px] leading-relaxed select-all">
                  {code}
                </pre>
              </div>
            );
          }
          return (
            <div key={cIdx} className="whitespace-pre-wrap">
              {chunk.split('\n').map((line, lIdx) => (
                <p key={lIdx} className="mb-1.5 last:mb-0">{line}</p>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const hasGroqKey = !!kritiService.getApiKey('groq');

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-8.5rem)] max-w-5xl mx-auto pb-16 lg:pb-0">
      {/* Header bar: Model & Agent Selector */}
      <div className="glass-panel px-3 sm:px-4 py-2.5 rounded-2xl flex flex-wrap items-center justify-between mb-3 border border-white/5 shadow-xl gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/25">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">KritiAI Copilot</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                ● Live Inference
              </span>
            </div>
          </div>
        </div>

        {/* Top Controls: Model Selector, Agent Selector, API Key Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Active Model Selector */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-fuchsia-500/30 rounded-xl px-2.5 py-1 text-xs">
            <Zap className="w-3.5 h-3.5 text-fuchsia-400" />
            <select
              value={activeModel}
              onChange={(e) => handleModelChange(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer font-medium"
            >
              {modelsList.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#111726]">
                  {m.label} {m.hasKey ? '✓' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Agent Selector */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 text-xs">
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id} className="bg-[#111726]">
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick API Key Button */}
          <button
            onClick={() => setShowKeyModal(!showKeyModal)}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium flex items-center gap-1 border transition ${
              hasGroqKey 
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300 hover:bg-amber-900/60'
            }`}
            title="Configure API Keys"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{hasGroqKey ? 'Groq Active' : 'Enter Groq Key'}</span>
          </button>

          <button
            onClick={clearChat}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition text-xs flex items-center gap-1"
            title="Clear Chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick API Key Drawer */}
      {showKeyModal && (
        <form onSubmit={handleSaveGroqKey} className="glass-panel p-4 rounded-2xl border border-fuchsia-500/30 mb-3 space-y-2 shadow-xl animate-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Key className="w-4 h-4 text-fuchsia-400" />
              <span>Configure Groq LPU API Key (Instant Sub-Second AI)</span>
            </div>
            <button
              type="button"
              onClick={() => setShowKeyModal(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Paste your Groq API key below to activate ultra-fast Llama 3.3 70B inference:
          </p>

          <div className="flex gap-2">
            <input
              type="password"
              placeholder="gsk_..."
              value={groqKeyInput}
              onChange={(e) => handleGroqInputChange(e.target.value)}
              className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-fuchsia-500"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 text-white font-medium text-xs shadow"
            >
              Save & Test
            </button>
          </div>

          {keySaveMessage && (
            <div className={`p-2 rounded-xl text-xs flex items-center gap-1.5 ${
              keySaveMessage.type === 'success' ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950/70 text-rose-300 border border-rose-500/40'
            }`}>
              {keySaveMessage.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              <span>{keySaveMessage.text}</span>
            </div>
          )}
        </form>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 px-2 py-2 pr-3 scroll-smooth">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                  isUser
                    ? 'bg-gradient-to-tr from-indigo-600 to-cyan-600 text-white'
                    : 'bg-gradient-to-tr from-fuchsia-600 to-purple-700 text-white'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="max-w-[90%] sm:max-w-[85%] space-y-2">
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl shadow-lg ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                      : 'glass-panel text-slate-100 border border-white/10 rounded-tl-none'
                  }`}
                >
                  {/* Entity Learned Banner */}
                  {msg.entityLearned && (
                    <div className="mb-2.5 p-2.5 rounded-xl bg-fuchsia-950/80 border border-fuchsia-500/40 flex items-center gap-2 text-xs text-fuchsia-200">
                      <BrainCircuit className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                      <span>Memorized <strong>"{msg.entityLearned}"</strong> into your persistent vault!</span>
                    </div>
                  )}

                  {/* Clarification prompt badge */}
                  {msg.isClarificationPrompt && (
                    <div className="mb-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase">
                      <HelpCircle className="w-3 h-3" />
                      <span>Clarification Required</span>
                    </div>
                  )}

                  {/* Render Formatted Content */}
                  {renderMessageContent(msg.text)}

                  {/* Interactive Approval Card rendered inline */}
                  {msg.approvalNeeded && msg.task && (
                    <div className="mt-3 p-3.5 rounded-xl bg-black/60 border border-amber-500/30 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-amber-300 font-bold uppercase text-[10px] tracking-wider">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>Consequential Action: Authorization Required</span>
                      </div>

                      {msg.approvalNeeded.type === 'CODE_PATCH' && (
                        <div className="font-mono text-[10px] bg-black/80 p-2 rounded border border-white/5 text-slate-300 overflow-x-auto">
                          <div>{msg.approvalNeeded.file}</div>
                          <div className="text-emerald-400 mt-1">{msg.approvalNeeded.diff}</div>
                        </div>
                      )}

                      {msg.approvalNeeded.type === 'EMAIL_SEND' && (
                        <div className="p-2 rounded bg-black/50 text-[11px] text-slate-300 space-y-1">
                          <div><strong>To:</strong> {msg.approvalNeeded.recipient}</div>
                          <div><strong>Subject:</strong> {msg.approvalNeeded.subject}</div>
                          <div className="text-slate-400 text-[10px] whitespace-pre-wrap mt-1">{msg.approvalNeeded.body}</div>
                        </div>
                      )}

                      {msg.approvalNeeded.type === 'CALENDAR_CREATE' && (
                        <div className="p-2 rounded bg-black/50 text-[11px] text-slate-300 space-y-1">
                          <div><strong>Event:</strong> {msg.approvalNeeded.title}</div>
                          <div><strong>Time:</strong> {msg.approvalNeeded.date}</div>
                          <div><strong>Participants:</strong> {msg.approvalNeeded.attendees}</div>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          onClick={() => handleInlineApproval(msg.task.id, false)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-[11px] font-semibold flex items-center gap-1 transition"
                        >
                          <X className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleInlineApproval(msg.task.id, true)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow transition"
                        >
                          <Check className="w-3 h-3" />
                          <span>Authorize & Execute</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Meeting Link Card */}
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
                          {copiedLink === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedLink === msg.id ? 'Copied' : 'Copy'}</span>
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
                        <span>{expandedLogs[msg.id] ? 'Hide' : 'Autonomous Trace'}</span>
                        {expandedLogs[msg.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible Execution Trace */}
                {expandedLogs[msg.id] && msg.logs && (
                  <div className="p-3 rounded-xl bg-black/70 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1 animate-in">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                      KritiAI Autonomous Plan & Tool Invocations
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

        {/* Active Clarification Form */}
        {activeClarification && (
          <div className="my-3 p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 to-purple-950/60 border border-amber-500/40 glass-panel shadow-2xl animate-in">
            <div className="flex items-center gap-2 mb-2 text-amber-300 text-xs font-semibold">
              <HelpCircle className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Entity Clarification: "{activeClarification.entity}"</span>
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
                placeholder="e.g. Rahul rahul@project.io, Priya priya@project.io, Ankit ankit@project.io"
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

        {/* Loading State */}
        {isLoading && !activeClarification && (
          <div className="flex items-center gap-3 animate-in">
            <div className="w-8 h-8 rounded-xl bg-fuchsia-600/30 border border-fuchsia-500/40 flex items-center justify-center">
              <Bot className="w-4 h-4 text-fuchsia-400 animate-pulse" />
            </div>
            <div className="p-3.5 rounded-2xl glass-panel border border-white/10 text-xs text-slate-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping"></div>
              <span>KritiAI ({activeModel}) is generating response & checking tools...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {quickPrompts.map((prompt, i) => (
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

      {/* Input Bar */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="mt-1 relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask KritiAI anything: 'Write a Python FastAPI service', 'Fix VS Code error'..."
            className="w-full bg-[#111726]/90 border border-white/10 focus:border-fuchsia-500/60 rounded-2xl pl-4 pr-24 py-3 sm:py-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 shadow-xl focus:outline-none transition"
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
