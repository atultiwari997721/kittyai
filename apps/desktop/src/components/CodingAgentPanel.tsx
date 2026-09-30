import React, { useState } from 'react';
import { Code2, Terminal, Play, CheckCircle2, AlertTriangle, FileCode, Camera, ArrowRight, RotateCcw } from 'lucide-react';
import { KittyApiClient } from '@kittyai/core';

interface Props {
  api: KittyApiClient;
}

export const CodingAgentPanel: React.FC<Props> = ({ api }) => {
  const [rawError, setRawError] = useState(
    `Traceback (most recent call last):\n  File "server/main.py", line 42, in <module>\n    from services.auth import verify_token\nModuleNotFoundError: No module named 'services.auth'`
  );
  const [activeFile, setActiveFile] = useState('server/main.py');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [proposal, setProposal] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyStatus, setApplyStatus] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCaptureVSCode = async () => {
    try {
      const cap = await api.captureScreen('Visual Studio Code');
      setCapturedImage(cap.base64Png);
    } catch (e: any) {
      alert(`Could not capture VS Code: ${e.message}`);
    }
  };

  const handleAnalyzeError = async () => {
    setIsAnalyzing(true);
    setProposal(null);
    setApplyStatus(null);
    try {
      const res = await api.analyzeTerminalError(rawError, undefined);
      setAnalysisResult(res.analysis);
      if (res.proposal) {
        setProposal(res.proposal);
      }
    } catch (e: any) {
      alert(`Error analyzing terminal trace: ${e.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyPatch = async () => {
    if (!proposal || !proposal.diffs) return;
    setIsApplying(true);
    try {
      const patches = proposal.diffs.map((d: any) => ({
        filePath: d.filePath,
        patchedContent: d.patchedContent
      }));
      const res = await api.applyCodePatch(proposal.id, patches);
      if (res.success) {
        setApplyStatus(`Applied cleanly to ${res.modifiedFiles.join(', ')}. Backup created.`);
      } else {
        setApplyStatus(`Failed: ${res.modifiedFiles}`);
      }
    } catch (e: any) {
      setApplyStatus(`Error: ${e.message}`);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-400" />
            VS Code Developer & Autonomous Coding Agent
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Parse terminal error traces, capture active VS Code screens, and apply surgical diff patches.
          </p>
        </div>

        <button
          onClick={handleCaptureVSCode}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyber-card border border-cyber-border hover:border-emerald-500/50 text-xs text-slate-200 transition-all"
        >
          <Camera className="w-4 h-4 text-emerald-400" />
          <span>Capture VS Code Screen</span>
        </button>
      </div>

      {capturedImage && (
        <div className="glass-panel p-3 rounded-2xl">
          <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
            <span>VS Code Target Frame:</span>
            <button onClick={() => setCapturedImage(null)} className="text-slate-400 hover:text-white text-xs">Dismiss</button>
          </div>
          <img src={`data:image/png;base64,${capturedImage}`} alt="VS Code Capture" className="w-full max-h-48 object-cover rounded-xl border border-cyber-border" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Terminal Input */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Terminal / Compiler Error Log
            </h3>
            <span className="text-[10px] text-slate-400">Python • TypeScript • Rust</span>
          </div>

          <textarea
            rows={8}
            value={rawError}
            onChange={(e) => setRawError(e.target.value)}
            placeholder="Paste your terminal error, compiler failure, or stack trace here..."
            className="w-full bg-cyber-dark/80 border border-cyber-border rounded-xl p-3 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500"
          />

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={activeFile}
              onChange={(e) => setActiveFile(e.target.value)}
              placeholder="Active file path (optional, e.g. src/App.tsx)"
              className="flex-1 bg-cyber-dark/80 border border-cyber-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />

            <button
              onClick={handleAnalyzeError}
              disabled={isAnalyzing || !rawError.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-lg disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  Diagnosing...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Analyze & Fix
                </>
              )}
            </button>
          </div>
        </div>

        {/* Diagnosis & Diff Proposal */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-400" />
            AI Root Cause & Unified Diff Patch
          </h3>

          {!proposal && !isAnalyzing && (
            <div className="h-56 flex flex-col items-center justify-center text-slate-500 text-xs border border-dashed border-cyber-border rounded-xl p-4 text-center">
              <Code2 className="w-8 h-8 text-slate-600 mb-2" />
              <span>Paste an error log and click "Analyze & Fix" to generate a surgical diff patch.</span>
            </div>
          )}

          {isAnalyzing && (
            <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-xs gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin"></div>
              <span>Inspecting code, calculating AST impact, and drafting diff patch...</span>
            </div>
          )}

          {proposal && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
                <div className="font-semibold text-emerald-300">Root Cause:</div>
                <p className="text-slate-300">{proposal.rootCause || proposal.explanation}</p>
              </div>

              {proposal.diffs && proposal.diffs[0] && proposal.diffs[0].unifiedDiff && (
                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>Patch Preview:</span>
                    <span className="text-emerald-400">+{proposal.diffs[0].additionsCount} / -{proposal.diffs[0].deletionsCount}</span>
                  </div>
                  <pre className="max-h-40 overflow-y-auto p-3 rounded-xl bg-cyber-dark font-mono text-[11px] text-slate-200 border border-cyber-border whitespace-pre-wrap">
                    {proposal.diffs[0].unifiedDiff}
                  </pre>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleApplyPatch}
                  disabled={isApplying}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
                >
                  {isApplying ? (
                    'Writing to file...'
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Apply Diff Patch to Local File
                    </>
                  )}
                </button>
              </div>

              {applyStatus && (
                <div className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 p-2 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{applyStatus}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
