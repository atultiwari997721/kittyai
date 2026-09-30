'use client';

import React, { useState } from 'react';
import { 
  PhoneCall, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Play, 
  CheckSquare, 
  Square,
  Users,
  ExternalLink 
} from 'lucide-react';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([
    {
      id: 'meet-1',
      title: 'Weekly Engineering & Roadmap Sync',
      platform: 'google_meet',
      joinUrl: 'https://meet.google.com/abc-defg-hij',
      startTime: 'Today, 3:30 PM',
      delegateStatus: 'completed',
      summary: 'Reviewed KittyAI desktop overlay architecture, Playwright meeting runner, and Supabase Realtime schema. Agreed to test Windows installer end-to-end.',
      keyDecisions: [
        'Desktop app to support both transparent HUD and main dashboard mode',
        'Supabase Realtime enabled for instant web and mobile synchronization'
      ],
      actionItems: [
        { id: 'act-1', title: 'Verify Playwright audio capture and Whisper transcription', assignee: 'Bob', done: true },
        { id: 'act-2', title: 'Test VS Code diff patcher on monorepo files', assignee: 'Charlie', done: false },
        { id: 'act-3', title: 'Deploy Next.js 14 web console to Vercel production', assignee: 'Atul', done: false }
      ]
    },
    {
      id: 'meet-2',
      title: 'Product Design: Assist Mode Overlay UX',
      platform: 'google_meet',
      joinUrl: 'https://meet.google.com/uvw-xyza-bcd',
      startTime: 'Tomorrow, 10:00 AM',
      delegateStatus: 'scheduled',
      summary: 'Scheduled meeting. You can click "Join On My Behalf" if you are unable to attend.',
      keyDecisions: [],
      actionItems: []
    }
  ]);

  const toggleActionItem = (meetingId: string, actionId: string) => {
    setMeetings(meetings.map(m => {
      if (m.id !== meetingId) return m;
      return {
        ...m,
        actionItems: m.actionItems.map(a => a.id === actionId ? { ...a, done: !a.done } : a)
      };
    }));
  };

  const triggerJoin = (meetingId: string) => {
    alert(`Autonomous Meeting Delegate dispatched from Web Console for meeting ${meetingId}. Joining call via Playwright...`);
    setMeetings(meetings.map(m => m.id === meetingId ? { ...m, delegateStatus: 'delegate_joining' } : m));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <PhoneCall className="w-7 h-7 text-rose-400" />
            Autonomous Meeting Delegate
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Missed a meeting? KittyAI enters calls on your behalf, takes verbatim notes, and compiles actionable deliverables.
          </p>
        </div>

        <button
          onClick={() => {
            const url = prompt('Enter Google Meet, Zoom, or Teams URL:');
            if (url) {
              alert(`Delegating call: ${url}`);
            }
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-kitty-600 hover:from-rose-500 hover:to-kitty-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg transition-all"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Delegate Instant Meeting</span>
        </button>
      </div>

      {/* Meetings List */}
      <div className="space-y-6">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyber-border pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100">{meeting.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {meeting.startTime}
                  </span>
                  <span className="text-kitty-400 font-medium">Google Meet</span>
                  <a
                    href={meeting.joinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-slate-200 flex items-center gap-1 underline"
                  >
                    Link <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  meeting.delegateStatus === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : meeting.delegateStatus === 'delegate_joining'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {meeting.delegateStatus.replace('_', ' ')}
                </span>

                {meeting.delegateStatus === 'scheduled' && (
                  <button
                    onClick={() => triggerJoin(meeting.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Join On My Behalf
                  </button>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-kitty-400" />
                Executive Summary
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed bg-black/20 p-3.5 rounded-xl border border-white/5">
                {meeting.summary}
              </p>
            </div>

            {/* Key Decisions */}
            {meeting.keyDecisions.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-300">Key Decisions Made:</div>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 pl-1">
                  {meeting.keyDecisions.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Items */}
            {meeting.actionItems.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  Extracted Action Items
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {meeting.actionItems.map((act) => (
                    <button
                      key={act.id}
                      onClick={() => toggleActionItem(meeting.id, act.id)}
                      className={`p-3 rounded-xl border text-left flex items-start justify-between gap-3 transition-all ${
                        act.done
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                          : 'bg-cyber-card border-cyber-border text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {act.done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-xs ${act.done ? 'line-through text-slate-500' : ''}`}>
                          {act.title}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 flex-shrink-0">
                        {act.assignee}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
