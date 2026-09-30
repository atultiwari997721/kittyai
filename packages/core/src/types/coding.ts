export interface TerminalErrorAnalysis {
  rawError: string;
  detectedLanguage?: 'python' | 'typescript' | 'javascript' | 'rust' | 'go' | 'csharp' | 'cpp' | 'other';
  errorType?: string;
  sourceFile?: string;
  lineNumber?: number;
  columnNumber?: number;
  rootCause: string;
  suggestedFix: string;
}

export interface FileDiff {
  filePath: string;
  originalContent?: string;
  patchedContent?: string;
  unifiedDiff: string;
  additionsCount: number;
  deletionsCount: number;
}

export interface CodeFixProposal {
  id: string;
  title: string;
  explanation: string;
  targetFiles: string[];
  diffs: FileDiff[];
  status: 'pending' | 'applied' | 'rejected' | 'failed';
  createdAt: string;
}

export interface CodingSession {
  id: string;
  userId?: string;
  projectName?: string;
  workspacePath: string;
  activeFile?: string;
  errorTrace?: string;
  proposal?: CodeFixProposal;
  status: 'detected' | 'patch_generated' | 'applied' | 'rejected' | 'failed';
  createdAt: string;
}
