import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('KritiAI VS Code Bridge Extension is active.');

  const sendDiagCmd = vscode.commands.registerCommand('kritiai.sendDiagnostics', async () => {
    const diagnostics = vscode.languages.getDiagnostics();
    const errors: Array<{ file: string; message: string; line: number }> = [];

    diagnostics.forEach(([uri, diags]) => {
      diags.forEach((d) => {
        if (d.severity === vscode.DiagnosticSeverity.Error) {
          errors.push({
            file: uri.fsPath,
            message: d.message,
            line: d.range.start.line + 1
          });
        }
      });
    });

    try {
      await fetch('http://127.0.0.1:8000/api/vscode/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors, workspace: vscode.workspace.rootPath })
      });
      vscode.window.showInformationMessage(`KritiAI: Sent ${errors.length} active error(s) to Assistant.`);
    } catch {
      vscode.window.showWarningMessage('KritiAI: Desktop Sidecar (port 8000) is currently offline.');
    }
  });

  const fixCmd = vscode.commands.registerCommand('kritiai.fixCurrentError', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    vscode.window.showInformationMessage('KritiAI Coding Agent is analyzing active error and preparing patch...');
  });

  context.subscriptions.push(sendDiagCmd, fixCmd);
}

export function deactivate() {}
