import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  HelpCircle, 
  Database, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Plus, 
  Layers, 
  PhoneCall, 
  Code2, 
  Sliders, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { KittyApiClient, ChatResponse, MemoryRecord } from '@kittyai/core';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isClarification?: boolean;
  taskId?: string;
  entityToLearn?: string;
  learnedNotice?: string;
  logs?: string[];
  meetingLink?: string;
}

interface Props {
  api: KittyApiClient;
}

export const ChatAssistant: React.FC<Props> = ({ api }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am **KittyAI**, your autonomous personal assistant. Tell me anything you want me to do—from scheduling meetings, executing Windows actions, and fixing code in VS Code, to sending messages.\n\nTry saying: *\"Schedule a meeting for tomorrow and send to the team\"*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeClarification, setActiveClarification] = useState<{ taskId: string; entity: string; question: string } | null>(null);
  const [clarificationInput, setClarificationInput] = useState('');
  
  // Memory drawer
  const [showMemoryBank, setShowMemoryBank] = useState(false);
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeClarification]);

  const loadMemories = async () => {
    try {
      const data = await api.getMemories();
      setMemories(data);
    } catch (e) {
      // quiet fallback
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: 'user',
        text: userText,
        timestamp: timeStr
      }
    ]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res: ChatResponse = await api.chat(userText);

      if (res.needsClarification) {
        // Needs user clarification
        setActiveClarification({
          taskId: res.taskId,
          entity: res.entityToLearn || 'unknown',
          question: res.clarificationQuestion || 'Could you please clarify?'
        });

        setMessages((prev) => [
          ...prev,
          {
            id: res.taskId,
            sender: 'ai',
            text: res.clarificationQuestion || 'Could you please clarify what you mean?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isClarification: true,
            taskId: res.taskId,
            entityToLearn: res.entityToLearn
          }
        ]);
      } else {
        // Task executed
        setActiveClarification(null);
        setMessages((prev) => [
          ...prev,
          {
            id: res.taskId,
            sender: 'ai',
            text: res.summary || 'Task completed successfully!',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            logs: res.executionLog,
            meetingLink: res.artifacts?.meeting?.meetingLink
          }
        ]);
        loadMemories();
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'ai',
          text: `Error executing request: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClarificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClarification || !clarificationInput.trim()) return;

    const currentClarification = activeClarification;
    const answer = clarificationInput.trim();
    setClarificationInput('');
    setActiveClarification(null);
    setIsLoading(true);

    // Add user response to chat
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: 'user',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    try {
      const res: ChatResponse = await api.sendClarification(currentClarification.taskId, answer);
      
      setMessages((prev) => [
        ...prev,
        {
          id: res.taskId,
          sender: 'ai',
          text: res.summary || 'Task completed successfully!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          logs: res.executionLog,
          learnedNotice: res.learnedMemory?.notice || `Learned and stored '${currentClarification.entity}' in personal memory!`,
          meetingLink: res.artifacts?.meeting?.meetingLink
        }
      ]);
      loadMemories();
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'ai',
          text: `Error completing clarified task: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddManualMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    try {
      await api.saveMemory(newKey, newValue, 'entity', 'User added memory record');
      setNewKey('');
      setNewValue('');
      loadMemories();
    } catch (e: any) {
      alert(`Error saving memory: ${e.message}`);
    }
  };

  const handleDeleteMemory = async (key: string) => {
    try {
      await api.deleteMemory(key);
      loadMemories();
    } catch (e: any) {
      alert(`Error deleting memory: ${e.message}`);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] gap-4">
      {/* Main Chat Box */}
      <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden border border-cyber-border">
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b border-cyber-border bg-[#0d1322] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-kitty-600 to-indigo-600 flex items-center justify-center shadow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                <span>KittyAI Autonomous Copilot</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                  Memory Active
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Natural Language Execution with Human-in-the-Loop Clarification
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowMemoryBank(!showMemoryBank)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyber-card border border-cyber-border hover:border-kitty-500/40 text-xs text-slate-300 hover:text-white transition-all"
          >
            <Database className="w-3.5 h-3.5 text-kitty-400" />
            <span>Memory Bank ({memories.length})</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m) => {
            const isAi = m.sender === 'ai';
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-2xl ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs shadow ${
                    isAi ? 'bg-kitty-600 text-white' : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className={`space-y-2 text-xs ${isAi ? 'text-slate-200' : 'text-slate-100'}`}>
                  <div
                    className={`p-3.5 rounded-2xl ${
                      isAi
                        ? m.isClarification
                          ? 'bg-amber-950/40 border border-amber-500/40 text-amber-200'
                          : 'bg-cyber-card border border-cyber-border'
                        : 'bg-gradient-to-r from-kitty-600 to-indigo-600 text-white shadow-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>

                    {m.meetingLink && (
                      <div className="mt-2.5 p-2 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between">
                        <span className="font-mono text-kitty-300 truncate">{m.meetingLink}</span>
                        <a
                          href={m.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-kitty-600 text-white text-[11px] font-medium hover:bg-kitty-500 transition-colors ml-2"
                        >
                          Open Link
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Learned Memory Notification */}
                  {m.learnedNotice && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl animate-fade-in">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{m.learnedNotice}</span>
                    </div>
                  )}

                  {/* Execution Logs */}
                  {m.logs && m.logs.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1 font-mono text-[11px] text-slate-400">
                      {m.logs.map((log, idx) => (
                        <div key={idx} className="truncate">{log}</div>
                      ))}
                    </div>
                  )}

                  <div className={`text-[10px] text-slate-500 ${isAi ? 'text-left' : 'text-right'}`}>
                    {m.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Active Clarification Card */}
          {activeClarification && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 space-y-3 animate-fade-in max-w-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>One-Time Clarification Needed for: "{activeClarification.entity}"</span>
              </div>
              <p className="text-xs text-slate-300">{activeClarification.question}</p>

              <form onSubmit={handleClarificationSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={clarificationInput}
                  onChange={(e) => setClarificationInput(e.target.value)}
                  placeholder="e.g. alice@company.com, bob@company.com, +1234567890"
                  className="flex-1 bg-cyber-dark border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={!clarificationInput.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  <span>Save & Execute</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-kitty-400 border-t-transparent animate-spin"></div>
              <span>KittyAI is analyzing request and planning actions...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-cyber-border bg-[#0d1322]">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything: 'Schedule a meeting for tomorrow and send to the team', 'Change theme to dark'..."
              className="flex-1 bg-cyber-dark border border-cyber-border rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-kitty-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-kitty-600 to-indigo-600 hover:from-kitty-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Memory Bank Sidebar / Drawer */}
      {showMemoryBank && (
        <div className="w-80 glass-panel rounded-2xl p-4 flex flex-col gap-4 border border-cyber-border animate-fade-in flex-shrink-0">
          <div className="flex items-center justify-between border-b border-cyber-border pb-2.5">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-kitty-400" />
              <h3 className="text-xs font-bold text-slate-100">Personal Knowledge Bank</h3>
            </div>
            <button
              onClick={() => setShowMemoryBank(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Facts and entity definitions that KittyAI has learned from your conversations. Next time you reference these, KittyAI knows what you mean automatically.
          </p>

          {/* Quick Add Memory */}
          <form onSubmit={handleAddManualMemory} className="space-y-2 p-2.5 rounded-xl bg-cyber-card border border-cyber-border">
            <div className="text-[10px] font-bold uppercase text-slate-400">Teach KittyAI a Fact:</div>
            <input
              type="text"
              placeholder="Key (e.g. 'team', 'client')"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="w-full bg-cyber-dark border border-cyber-border rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
            />
            <input
              type="text"
              placeholder="Value (e.g. 'john@acme.com, +12345')"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-full bg-cyber-dark border border-cyber-border rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
            />
            <button
              type="submit"
              className="w-full py-1.5 rounded-lg bg-kitty-600 hover:bg-kitty-500 text-white text-[11px] font-medium flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Save Record</span>
            </button>
          </form>

          {/* Stored Records List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {memories.length === 0 ? (
              <div className="text-center text-slate-500 text-xs py-8">
                No memories recorded yet. Ask KittyAI to schedule something or teach it a fact!
              </div>
            ) : (
              memories.map((m) => (
                <div
                  key={m.key}
                  className="p-2.5 rounded-xl bg-cyber-card border border-cyber-border space-y-1 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-kitty-300">{m.key}</span>
                    <button
                      onClick={() => handleDeleteMemory(m.key)}
                      className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Forget this record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-300 break-words font-mono bg-black/30 p-1.5 rounded">
                    {typeof m.value === 'object' ? JSON.stringify(m.value) : String(m.value)}
                  </div>
                  <div className="text-[9px] text-slate-500 flex items-center justify-between">
                    <span>{m.category}</span>
                    <span>{m.source}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
