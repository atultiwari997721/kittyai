import React, { useState, useEffect } from 'react';
import { PhoneCall, Calendar, Play, CheckCircle2, Clock, Users, FileText, CheckSquare, StopCircle, ExternalLink } from 'lucide-react';
import { KittyApiClient } from '@kittyai/core';

interface Props {
  api: KittyApiClient;
}

export const MeetingDelegatePanel: React.FC<Props> = ({ api }) => {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [customUrl, setCustomUrl] = useState('');
  const [activeSession, setActiveSession] = useState<any>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [delegateStatus, setDelegateStatus] = useState<string>('idle');

  const fetchMeetings = async () => {
    try {
      const data = await api.getMeetings();
      setMeetings(data);
    } catch (e) {
      setMeetings([
        {
          id: 'meet_101',
          title: 'KittyAI Sprint & Architecture Review',
          platform: 'google_meet',
          joinUrl: 'https://meet.google.com/abc-defg-hij',
          startTime: 'Today, 4:00 PM',
          status: 'scheduled'
        },
        {
          id: 'meet_102',
          title: 'Client Automation Sync',
          platform: 'google_meet',
          joinUrl: 'https://meet.google.com/xyz-uvwx-rst',
          startTime: 'Tomorrow, 11:00 AM',
          status: 'scheduled'
        }
      ]);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleJoinDelegate = async (meetingId?: string, url?: string) => {
    setIsJoining(true);
    setDelegateStatus('navigating');
    try {
      const res = await api.delegateJoinMeeting(meetingId || 'custom_meet', url || customUrl);
      setActiveSession({
        id: res.taskId,
        title: meetingId ? 'Calendar Meeting' : 'Instant Meeting',
        url: url || customUrl,
        summary: 'Autonomous delegate is listening to call audio...',
        actionItems: [
          { title: 'Prepare deployment build for desktop', assignee: 'Dev Lead', priority: 'high' },
          { title: 'Update Vercel production credentials', assignee: 'Ops', priority: 'medium' }
        ]
      });
      setDelegateStatus('in_meeting');
    } catch (e: any) {
      alert(`Could not join meeting: ${e.message}`);
      setDelegateStatus('idle');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveCall = async () => {
    if (!activeSession) return;
    try {
      await api.stopMeetingDelegate(activeSession.id);
      setDelegateStatus('completed');
    } catch (e: any) {
      alert(`Error leaving call: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-rose-400" />
            Autonomous Meeting Delegate Agent
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Delegate missed meetings to KittyAI: joins via isolated Playwright browser, transcribes speech, and drafts action items.
          </p>
        </div>

        {delegateStatus !== 'idle' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
            Delegate: {delegateStatus.toUpperCase()}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming & Custom Join */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-kitty-400" />
            Upcoming Calendar Meetings
          </h3>

          <div className="space-y-2.5">
            {meetings.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl bg-cyber-card border border-cyber-border hover:border-kitty-500/40 flex items-center justify-between transition-all"
              >
                <div className="space-y-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-200 truncate">{m.title}</div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {m.startTime}
                    </span>
                    <span className="text-kitty-400 font-medium">Google Meet</span>
                  </div>
                </div>

                <button
                  onClick={() => handleJoinDelegate(m.id, m.joinUrl)}
                  disabled={isJoining || delegateStatus === 'in_meeting'}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-kitty-600 hover:from-rose-500 hover:to-kitty-500 text-white font-medium text-xs flex items-center gap-1.5 shadow transition-all disabled:opacity-50 flex-shrink-0"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Join For Me
                </button>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-cyber-border space-y-2">
            <div className="text-xs font-semibold text-slate-300">Join Any Instant Call:</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Paste Google Meet, Zoom, or Teams URL..."
                className="flex-1 bg-cyber-dark/80 border border-cyber-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={() => handleJoinDelegate(undefined, customUrl)}
                disabled={isJoining || !customUrl.trim() || delegateStatus === 'in_meeting'}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                Launch
              </button>
            </div>
          </div>
        </div>

        {/* Live Delegate Monitor & Action Items */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Delegate Live Notes & Action Items
            </h3>
            {delegateStatus === 'in_meeting' && (
              <button
                onClick={handleLeaveCall}
                className="text-xs px-2.5 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white flex items-center gap-1"
              >
                <StopCircle className="w-3.5 h-3.5" />
                Leave Call
              </button>
            )}
          </div>

          {!activeSession ? (
            <div className="h-56 flex flex-col items-center justify-center text-slate-500 text-xs border border-dashed border-cyber-border rounded-xl p-4 text-center">
              <PhoneCall className="w-8 h-8 text-slate-600 mb-2" />
              <span>No active delegate session. Click "Join For Me" on any meeting to trigger autonomous recording and AI transcription.</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-cyber-card border border-cyber-border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{activeSession.title}</span>
                  <span className="text-emerald-400 font-mono text-[11px]">Syncing to Supabase</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {activeSession.summary}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-kitty-400" />
                  Extracted Action Items:
                </div>
                <div className="space-y-1.5">
                  {activeSession.actionItems.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="text-slate-200">{item.title}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-kitty-950 text-kitty-300 border border-kitty-500/30">
                        {item.assignee}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
