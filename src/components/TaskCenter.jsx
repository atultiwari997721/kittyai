import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileCode, 
  Mail, 
  Calendar, 
  Terminal, 
  Check, 
  X, 
  ShieldAlert, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { kritiService } from '../services/kritiService';

export const TaskCenter = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'waiting' | 'running' | 'completed'
  const [editingApproval, setEditingApproval] = useState(null);
  const [editedText, setEditedText] = useState('');

  const loadTasks = () => {
    setTasks(kritiService.getTasks());
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = (taskId, type) => {
    kritiService.updateTaskStatus(taskId, 'COMPLETED', `Approved and executed by user at ${new Date().toLocaleTimeString()}`);
    loadTasks();
  };

  const handleReject = (taskId) => {
    kritiService.updateTaskStatus(taskId, 'CANCELLED', `Rejected by user at ${new Date().toLocaleTimeString()}`);
    loadTasks();
  };

  const waitingCount = tasks.filter(t => t.status === 'WAITING_APPROVAL').length;

  const filteredTasks = tasks.filter(t => {
    if (filter === 'waiting') return t.status === 'WAITING_APPROVAL';
    if (filter === 'running') return t.status === 'RUNNING';
    if (filter === 'completed') return t.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-fuchsia-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            <span>Autonomous Execution Center</span>
          </div>
          <h1 className="text-xl font-extrabold text-white">Task Lifecycle & Approvals</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            KritiAI requires explicit user approval before executing consequential actions like sending emails, applying code diffs, or creating events.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/10 rounded-2xl text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filter === 'all' ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('waiting')}
            className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
              filter === 'waiting' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <span>Waiting Approval</span>
            {waitingCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-black font-bold text-[10px] flex items-center justify-center">
                {waitingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filter === 'completed' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => {
          const isWaiting = task.status === 'WAITING_APPROVAL';
          const isCompleted = task.status === 'COMPLETED';
          const isCancelled = task.status === 'CANCELLED';

          return (
            <div
              key={task.id}
              className={`glass-panel p-5 rounded-2xl border transition-all ${
                isWaiting 
                  ? 'border-amber-500/40 shadow-xl shadow-amber-500/5 bg-amber-950/20' 
                  : 'border-white/5'
              }`}
            >
              {/* Task Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isWaiting 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : isCompleted 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-slate-500/20 text-slate-300'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Agent: {task.agent}</span>
                    <span className="text-xs text-slate-500 font-mono">• {task.model}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{task.goal}</h3>
                </div>

                <div className="text-[11px] text-slate-500 font-mono whitespace-nowrap">
                  {new Date(task.createdAt).toLocaleTimeString()}
                </div>
              </div>

              {/* Execution Steps */}
              {task.steps && task.steps.length > 0 && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 mb-3 text-xs font-mono text-slate-300">
                  {task.steps.map((s, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-fuchsia-400">✓</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Consequential Approval Card */}
              {task.approvalData && isWaiting && (
                <div className="p-4 rounded-xl bg-black/70 border border-amber-500/30 space-y-3 my-3">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Consequential Action: Authorization Required</span>
                  </div>

                  {/* Code Patch Diff Approval */}
                  {task.approvalData.type === 'CODE_PATCH' && (
                    <div className="space-y-2 text-xs">
                      <div className="text-slate-300 font-mono">File: {task.approvalData.file}</div>
                      <pre className="p-3 rounded-xl bg-[#090d16] border border-white/10 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                        {task.approvalData.diff.split('\n').map((line, lIdx) => {
                          const isAdd = line.startsWith('+');
                          const isDel = line.startsWith('-');
                          return (
                            <div 
                              key={lIdx} 
                              className={isAdd ? 'text-emerald-400 bg-emerald-950/30 px-1 rounded' : isDel ? 'text-rose-400 bg-rose-950/30 px-1 rounded' : ''}
                            >
                              {line}
                            </div>
                          );
                        })}
                      </pre>
                    </div>
                  )}

                  {/* Email Send Approval */}
                  {task.approvalData.type === 'EMAIL_SEND' && (
                    <div className="space-y-2 text-xs">
                      <div className="text-slate-300">
                        <strong>To:</strong> <code className="bg-black/60 px-1.5 py-0.5 rounded text-fuchsia-300">{task.approvalData.recipient}</code>
                      </div>
                      <div className="text-slate-300">
                        <strong>Subject:</strong> {task.approvalData.subject}
                      </div>
                      <div className="p-3 rounded-xl bg-black/50 border border-white/5 text-slate-300 whitespace-pre-wrap">
                        {task.approvalData.body}
                      </div>
                    </div>
                  )}

                  {/* Calendar Create Approval */}
                  {task.approvalData.type === 'CALENDAR_CREATE' && (
                    <div className="space-y-2 text-xs">
                      <div className="text-slate-300">
                        <strong>Event Title:</strong> {task.approvalData.title}
                      </div>
                      <div className="text-slate-300">
                        <strong>Date & Time:</strong> {task.approvalData.date}
                      </div>
                      <div className="text-slate-300">
                        <strong>Participants:</strong> <code className="bg-black/60 px-1.5 py-0.5 rounded text-fuchsia-300">{task.approvalData.attendees}</code>
                      </div>
                      <div className="text-slate-300">
                        <strong>Room URL:</strong> <a href={task.approvalData.meetingUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">{task.approvalData.meetingUrl}</a>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => handleReject(task.id)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject & Cancel</span>
                    </button>
                    <button
                      onClick={() => handleApprove(task.id, task.approvalData.type)}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Authorize & Execute</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Resolution Note */}
              {task.resolution && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{task.resolution}</span>
                </div>
              )}
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="glass-panel p-12 rounded-3xl text-center text-slate-500 text-xs space-y-2">
            <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No tasks currently in this view.</p>
            <p className="text-slate-600">Commands given in Chat Copilot will populate tasks and approval requests here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
