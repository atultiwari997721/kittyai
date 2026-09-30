import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TerminalIcon, 
  Play, 
  FolderPlus, 
  FileCode2, 
  Copy, 
  Check, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Folder, 
  File, 
  Laptop, 
  Radio, 
  Zap, 
  Sliders, 
  Code2, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { kritiService } from '../services/kritiService';

export const TerminalWorkspace = ({ onOpenPairing }) => {
  const [activeTab, setActiveTab] = useState('terminal'); // 'terminal' | 'codestudio' | 'files'
  const [commandInput, setCommandInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [workingDir, setWorkingDir] = useState('K:\\Projects\\kittyai');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState([]);
  
  // Terminal logs output
  const [terminalLogs, setTerminalLogs] = useState([
    {
      id: 'init_1',
      command: 'echo "KritiAI Desktop Kernel v2.5 Initialized - Native Terminal & File System Active"',
      stdout: 'KritiAI Desktop Kernel v2.5 Initialized - Native Terminal & File System Active\nPlatform: Windows 11 Pro 64-bit | PowerShell 7 / Windows Terminal\nType any command below (e.g. dir, python --version, git status, npm test)',
      stderr: '',
      returncode: 0,
      elapsedMs: 15,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  // Code Studio state
  const [codePrompt, setCodePrompt] = useState('Write a Python script that checks local system metrics (CPU, RAM, Disk) and writes them to a JSON file');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('python');
  const [filePath, setFilePath] = useState('workspace/system_metrics.py');
  const [codeContent, setCodeContent] = useState(`import os
import json
import time

def get_system_summary():
    data = {
        "status": "online",
        "agent": "KritiAI Autonomous Personal Assistant",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "platform": os.name,
        "metrics": {
            "execution_mode": "local_kernel",
            "active_model": "Groq LPU (Llama 3.3 70B)",
            "terminal_access": True,
            "filesystem_access": True
        }
    }
    print("[KritiAI Engine] Collecting local system status...")
    print(json.dumps(data, indent=2))
    return data

if __name__ == "__main__":
    get_system_summary()
`);
  const [fileActionStatus, setFileActionStatus] = useState(null);
  const [folderPathInput, setFolderPathInput] = useState('workspace/new_feature');

  // File explorer state
  const [fileList, setFileList] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Pairing state
  const [pairingState, setPairingState] = useState(kritiService.getPairingState());
  const [copiedId, setCopiedId] = useState(null);

  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs, isExecuting]);

  useEffect(() => {
    setPairingState(kritiService.getPairingState());
    loadWorkspaceFiles();
  }, []);

  const loadWorkspaceFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const res = await kritiService.listFiles(workingDir);
      if (res && res.entries) {
        setFileList(res.entries);
      }
    } catch (e) {
      console.warn('File list error:', e);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleRunCommand = async (cmdToRun = null) => {
    const cmd = cmdToRun || commandInput;
    if (!cmd.trim() || isExecuting) return;

    setIsExecuting(true);
    setCommandHistory(prev => [cmd.trim(), ...prev.filter(c => c !== cmd.trim())]);
    setHistoryIndex(-1);
    setCommandInput('');

    try {
      const res = await kritiService.executeTerminal(cmd.trim(), workingDir);
      setTerminalLogs(prev => [
        ...prev,
        {
          id: 'log_' + Date.now(),
          command: cmd.trim(),
          stdout: res.stdout || '',
          stderr: res.stderr || '',
          returncode: res.returncode !== undefined ? res.returncode : (res.success ? 0 : 1),
          elapsedMs: res.elapsedMs || 80,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } catch (err) {
      setTerminalLogs(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          command: cmd.trim(),
          stdout: '',
          stderr: err.message || 'Execution error.',
          returncode: 1,
          elapsedMs: 0,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleRunCommand();
    } else if (e.key === 'ArrowUp') {
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setCommandInput(commandHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex > 0) {
        const prevIndex = historyIndex - 1;
        setHistoryIndex(prevIndex);
        setCommandInput(commandHistory[prevIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommandInput('');
      }
    }
  };

  const handleClearLogs = () => {
    setTerminalLogs([]);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // AI Code Generator
  const handleGenerateCode = async (e) => {
    if (e) e.preventDefault();
    if (!codePrompt.trim() || isGeneratingCode) return;

    setIsGeneratingCode(true);
    setFileActionStatus(null);
    try {
      const prompt = `Write production-ready, clean, standalone ${codeLanguage} code for: "${codePrompt}". Provide ONLY valid code with no markdown formatting or commentary.`;
      const activeModel = kritiService.resolveActiveModel();
      const res = await kritiService.processChat(prompt, 'CODE_AGENT', activeModel);

      let cleanCode = res.reply || res.summary || '';
      // Strip markdown code fences if model returned them
      cleanCode = cleanCode.replace(/^```[a-z]*\n/i, '').replace(/\n```$/g, '').trim();

      if (cleanCode) {
        setCodeContent(cleanCode);
        setFileActionStatus({
          type: 'success',
          text: `Code generated using ${activeModel}! Ready to save or run.`
        });
      }
    } catch (e) {
      setFileActionStatus({ type: 'error', text: 'Generation error: ' + e.message });
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Create file on user's disk
  const handleCreateFileOnDisk = async () => {
    if (!filePath.trim() || !codeContent) return;
    setFileActionStatus(null);
    try {
      const res = await kritiService.createFile(filePath.trim(), codeContent);
      if (res.success) {
        setFileActionStatus({
          type: 'success',
          text: `File successfully written to disk: ${res.path || filePath} (${res.sizeBytes || codeContent.length} bytes)`
        });
        loadWorkspaceFiles();
      } else {
        setFileActionStatus({ type: 'error', text: res.error || 'Failed to create file.' });
      }
    } catch (e) {
      setFileActionStatus({ type: 'error', text: e.message });
    }
  };

  // Run code on user's disk
  const handleRunCodeNow = async () => {
    if (!codeContent) return;
    setIsExecuting(true);
    setFileActionStatus({ type: 'info', text: 'Executing code via Python/Node runtime on local kernel...' });
    setActiveTab('terminal');

    try {
      const res = await kritiService.runCode(codeContent, codeLanguage, filePath.split('/').pop() || null);
      setTerminalLogs(prev => [
        ...prev,
        {
          id: 'code_run_' + Date.now(),
          command: `run ${codeLanguage} ${filePath}`,
          stdout: res.stdout || '',
          stderr: res.stderr || '',
          returncode: res.returncode !== undefined ? res.returncode : (res.success ? 0 : 1),
          elapsedMs: res.elapsedMs || 150,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      setFileActionStatus({
        type: res.success ? 'success' : 'error',
        text: res.success ? 'Code executed successfully in terminal!' : 'Code failed: ' + res.stderr
      });
    } catch (e) {
      setFileActionStatus({ type: 'error', text: 'Execution error: ' + e.message });
    } finally {
      setIsExecuting(false);
    }
  };

  // Create folder
  const handleCreateFolder = async (e) => {
    if (e) e.preventDefault();
    if (!folderPathInput.trim()) return;
    try {
      const res = await kritiService.createFolder(folderPathInput.trim());
      if (res.success) {
        setFileActionStatus({ type: 'success', text: `Folder created at: ${res.path || folderPathInput}` });
        loadWorkspaceFiles();
      }
    } catch (e) {
      setFileActionStatus({ type: 'error', text: e.message });
    }
  };

  const quickCommands = [
    { label: 'dir', cmd: 'dir', desc: 'List files' },
    { label: 'python --version', cmd: 'python --version', desc: 'Check Python' },
    { label: 'git status', cmd: 'git status', desc: 'Check Git' },
    { label: 'ipconfig', cmd: 'ipconfig', desc: 'Network info' },
    { label: 'tasklist (top 15)', cmd: 'tasklist | select -first 15', desc: 'Running tasks' },
    { label: 'npm test', cmd: 'npm test', desc: 'Run tests' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-20 lg:pb-6">
      {/* Top Banner */}
      <div className="glass-panel p-5 rounded-3xl border border-white/5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
            <TerminalIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">Superpower Terminal & Code Studio</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                DESKTOP ADVANCEMENT
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Execute real terminal commands on Windows, generate code with AI, create files & folders on disk, and run them instantly.
            </p>
          </div>
        </div>

        {/* Bilateral Pairing Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPairing}
            className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 border transition ${
              pairingState.paired
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-fuchsia-950/60 border-fuchsia-500/40 text-fuchsia-300 hover:bg-fuchsia-900/50'
            }`}
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>
              {pairingState.paired ? `Linked: ${pairingState.code} (${pairingState.deviceName})` : 'Pair Desktop App (6-Digit Code)'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition ${
              activeTab === 'terminal'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <TerminalIcon className="w-4 h-4" />
            <span>1. Windows Terminal Console</span>
          </button>

          <button
            onClick={() => setActiveTab('codestudio')}
            className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition ${
              activeTab === 'codestudio'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>2. AI Code Studio & File Runner</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('files');
              loadWorkspaceFiles();
            }}
            className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition ${
              activeTab === 'files'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>3. File & Folder Manager</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-slate-400 text-xs font-mono">
          <span>CWD:</span>
          <span className="text-slate-200 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
            {workingDir}
          </span>
        </div>
      </div>

      {/* ================= TAB 1: TERMINAL CONSOLE ================= */}
      {activeTab === 'terminal' && (
        <div className="space-y-4">
          {/* Quick Preset Command Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 text-[11px] font-medium flex-shrink-0">Presets:</span>
            {quickCommands.map((q) => (
              <button
                key={q.cmd}
                onClick={() => handleRunCommand(q.cmd)}
                disabled={isExecuting}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-600/30 border border-white/10 hover:border-purple-500/40 text-slate-300 hover:text-purple-200 transition font-mono text-[11px] flex-shrink-0"
              >
                ${q.label}
              </button>
            ))}
            <button
              onClick={handleClearLogs}
              className="ml-auto px-2.5 py-1 rounded-lg bg-white/5 hover:bg-rose-950/60 border border-white/10 text-slate-400 hover:text-rose-300 text-[11px] flex items-center gap-1 transition"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear Console</span>
            </button>
          </div>

          {/* Terminal Screen Container */}
          <div className="rounded-3xl border border-white/10 bg-[#07090e] shadow-2xl overflow-hidden font-mono text-xs">
            {/* Terminal Window Header */}
            <div className="bg-[#0f1422] px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <span className="text-slate-400 ml-2 font-semibold text-[11px]">
                  PowerShell (KritiAI Kernel Execution Engine)
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                UTF-8 • Process ID: 10488
              </div>
            </div>

            {/* Scrollable Terminal Output Body */}
            <div className="p-4 space-y-4 max-h-[460px] min-h-[320px] overflow-y-auto selection:bg-purple-600 selection:text-white">
              {terminalLogs.map((log) => (
                <div key={log.id} className="space-y-1.5 border-b border-white/5 pb-3">
                  {/* Command prompt row */}
                  <div className="flex items-center justify-between text-slate-400">
                    <div className="flex items-center gap-1.5 text-purple-300">
                      <span className="text-emerald-400 font-bold">PS {workingDir}&gt;</span>
                      <span className="text-white font-bold">{log.command}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>{log.elapsedMs}ms</span>
                      <button
                        onClick={() => handleCopy(log.stdout || log.stderr || '', log.id)}
                        className="p-1 hover:text-white transition"
                        title="Copy output"
                      >
                        {copiedId === log.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Standard output */}
                  {log.stdout && (
                    <pre className="text-emerald-300/90 whitespace-pre-wrap leading-relaxed pl-3 border-l-2 border-emerald-500/30">
                      {log.stdout}
                    </pre>
                  )}

                  {/* Standard error */}
                  {log.stderr && (
                    <pre className="text-rose-400 whitespace-pre-wrap leading-relaxed pl-3 border-l-2 border-rose-500/30">
                      {log.stderr}
                    </pre>
                  )}

                  {/* Exit status badge */}
                  <div className="text-[10px] text-slate-500 flex items-center gap-2 pt-0.5">
                    <span className={log.returncode === 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      Exit code: {log.returncode}
                    </span>
                    <span>•</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              ))}

              {isExecuting && (
                <div className="flex items-center gap-2 text-purple-400 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing command on Windows kernel...</span>
                </div>
              )}

              <div ref={terminalEndRef} />
            </div>

            {/* Terminal Input Bar */}
            <div className="p-3 bg-[#0d121f] border-t border-white/5 flex items-center gap-2">
              <span className="text-emerald-400 font-bold pl-2">PS&gt;</span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a Windows terminal command (e.g. dir, python script.py, npm run build) and press Enter..."
                className="flex-1 bg-transparent border-none text-white focus:outline-none font-mono text-xs placeholder:text-slate-600"
              />
              <button
                onClick={() => handleRunCommand()}
                disabled={isExecuting || !commandInput.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center gap-1.5 transition disabled:opacity-40 shadow-lg shadow-purple-600/30"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Execute</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: AI CODE STUDIO & FILE RUNNER ================= */}
      {activeTab === 'codestudio' && (
        <div className="space-y-4">
          {/* AI Code Generator Bar */}
          <div className="glass-panel p-5 rounded-3xl border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI Code Generator (Groq LPU Llama 3.3 70B / Gemini)</span>
              </div>
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="bg-black/60 border border-white/10 rounded-xl px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="python">Python 3.12</option>
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="powershell">PowerShell</option>
                <option value="typescript">TypeScript</option>
                <option value="batch">Windows Batch (.bat)</option>
              </select>
            </div>

            <form onSubmit={handleGenerateCode} className="flex gap-2">
              <input
                type="text"
                value={codePrompt}
                onChange={(e) => setCodePrompt(e.target.value)}
                placeholder="Describe what script or code you want KritiAI to write..."
                className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isGeneratingCode || !codePrompt.trim()}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 transition disabled:opacity-40"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGeneratingCode ? 'animate-spin' : ''}`} />
                <span>{isGeneratingCode ? 'Synthesizing...' : 'Generate Code'}</span>
              </button>
            </form>
          </div>

          {/* Code Editor & Execution Panel */}
          <div className="rounded-3xl border border-white/10 bg-[#07090e] shadow-2xl overflow-hidden font-mono text-xs">
            {/* Code Header Bar */}
            <div className="bg-[#0f1422] p-3 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs">Target File on Disk:</span>
                <input
                  type="text"
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  className="bg-black/60 border border-white/10 rounded-xl px-2.5 py-1 text-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500 w-64"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCreateFileOnDisk}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 font-medium text-xs flex items-center gap-1.5 transition"
                >
                  <File className="w-3.5 h-3.5" />
                  <span>Create File on Disk</span>
                </button>

                <button
                  type="button"
                  onClick={handleRunCodeNow}
                  disabled={isExecuting}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/25 transition disabled:opacity-40"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Run Code Now</span>
                </button>
              </div>
            </div>

            {/* Code Content TextArea */}
            <div className="p-4 bg-[#0a0d14]">
              <textarea
                rows={16}
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-mono text-xs text-indigo-200 focus:outline-none focus:border-indigo-500 leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Action Status Pill */}
          {fileActionStatus && (
            <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
              fileActionStatus.type === 'success'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                : fileActionStatus.type === 'error'
                ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                : 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/30'
            }`}>
              {fileActionStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{fileActionStatus.text}</span>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: FILE & FOLDER MANAGER ================= */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          {/* Create Folder Bar */}
          <div className="glass-panel p-4 rounded-3xl border border-white/5 flex items-center justify-between gap-3 text-xs">
            <form onSubmit={handleCreateFolder} className="flex items-center gap-2 flex-1">
              <span className="text-slate-400 font-medium">New Directory:</span>
              <input
                type="text"
                value={folderPathInput}
                onChange={(e) => setFolderPathInput(e.target.value)}
                placeholder="e.g. workspace/modules"
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center gap-1.5 transition shadow"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Create Folder</span>
              </button>
            </form>

            <button
              onClick={loadWorkspaceFiles}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
              <span>Refresh Files</span>
            </button>
          </div>

          {/* File Explorer Grid */}
          <div className="glass-panel p-5 rounded-3xl border border-white/5 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Folder className="w-4 h-4 text-sky-400" />
              <span>Workspace Files in {workingDir}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs font-mono">
              {fileList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-black/40 border border-white/5 hover:border-white/20 transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {item.isDir ? (
                      <Folder className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    ) : (
                      <File className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                    <span className="truncate text-slate-200">{item.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 flex-shrink-0">
                    {item.isDir ? 'DIR' : `${item.size} B`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
