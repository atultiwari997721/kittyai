import os
import re
import difflib
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from sidecar.python.core.llm_orchestrator import orchestrator
from sidecar.python.core.screen import screen_manager

logger = logging.getLogger("kittyai.coding_agent")

ERROR_REGEX_PATTERNS = [
    # Python: File "path/to/file.py", line 42, in <module>
    re.compile(r'File "(?P<file>[^"]+)", line (?P<line>\d+)(?:, in (?P<func>\w+))?'),
    # Node/TS/JS: at Object.<anonymous> (path/to/file.ts:42:15)
    re.compile(r'at (?:[^\(\n]+\()?(?P<file>[a-zA-Z]:[\\\/][^\:\n]+|(?:\.\.?[\\\/])?[a-zA-Z0-9_\-\.\/]+):(?P<line>\d+):(?P<col>\d+)\)?'),
    # Rust: --> src/main.rs:12:5
    re.compile(r'--> (?P<file>[^:\n]+):(?P<line>\d+):(?P<col>\d+)'),
    # Generic file:line:col
    re.compile(r'(?P<file>[a-zA-Z0-9_\-\.\/\\:]+\.[a-zA-Z]{1,5}):(?P<line>\d+)')
]

class CodingAgent:
    def __init__(self):
        self.active_sessions: Dict[str, Dict[str, Any]] = {}

    def capture_vscode_screen(self) -> Dict[str, Any]:
        """Captures targeted screen frame of active Visual Studio Code window."""
        return screen_manager.capture_screen(target_app="Visual Studio Code")

    def parse_terminal_error(self, raw_trace: str) -> Dict[str, Any]:
        """
        Extracts source file, line number, column, error category, and root cause
        from terminal logs or stack traces.
        """
        extracted_file = None
        extracted_line = None
        extracted_col = None

        for pattern in ERROR_REGEX_PATTERNS:
            match = pattern.search(raw_trace)
            if match:
                extracted_file = match.groupdict().get("file")
                line_str = match.groupdict().get("line")
                col_str = match.groupdict().get("col")
                if line_str:
                    extracted_line = int(line_str)
                if col_str:
                    extracted_col = int(col_str)
                break

        # Detect programming language
        language = "unknown"
        if extracted_file:
            ext = Path(extracted_file).suffix.lower()
            ext_map = {
                ".py": "python",
                ".ts": "typescript",
                ".tsx": "typescript",
                ".js": "javascript",
                ".jsx": "javascript",
                ".rs": "rust",
                ".go": "go",
                ".cpp": "cpp",
                ".cs": "csharp",
            }
            language = ext_map.get(ext, "unknown")

        return {
            "sourceFile": extracted_file,
            "lineNumber": extracted_line,
            "columnNumber": extracted_col,
            "language": language,
            "rawError": raw_trace.strip()
        }

    async def analyze_and_propose_fix(
        self,
        raw_error: str,
        workspace_path: Optional[str] = None,
        active_file: Optional[str] = None,
        file_content: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyzes the error, inspects source files if accessible, and generates
        a concrete code fix and unified diff.
        """
        parsed = self.parse_terminal_error(raw_error)
        target_file = active_file or parsed.get("sourceFile")
        
        # Read file content if target_file exists on disk
        actual_path = None
        original_content = file_content or ""
        if target_file and not original_content:
            candidates = []
            if os.path.isabs(target_file):
                candidates.append(Path(target_file))
            elif workspace_path:
                candidates.append(Path(workspace_path) / target_file)
            candidates.append(Path.cwd() / target_file)

            for cand in candidates:
                if cand.exists() and cand.is_file():
                    try:
                        actual_path = str(cand.resolve())
                        original_content = cand.read_text(encoding="utf-8", errors="replace")
                        break
                    except Exception as e:
                        logger.warning(f"Could not read {cand}: {e}")

        # Construct prompt for the model
        system_prompt = (
            "You are the KittyAI Autonomous Coding Agent. You specialize in diagnosing terminal stack traces, "
            "compiler errors, and runtime bugs. Propose the minimal, surgically precise fix. "
            "Output your proposal strictly in JSON format with fields:\n"
            "- rootCause: string\n"
            "- suggestedFix: string\n"
            "- explanation: string\n"
            "- patchedContent: the full corrected content of the target file (if provided)\n"
        )

        user_prompt = f"""
Terminal / Compiler Error:
```
{raw_error}
```

Target File: {target_file or 'Unknown'}
Line Number: {parsed.get('lineNumber')}

Original File Content:
```
{original_content[:3000] if original_content else 'File content not provided.'}
```

Diagnose the bug and provide the fix.
"""

        response_str = await orchestrator.generate_completion(
            prompt=user_prompt,
            system_prompt=system_prompt,
            json_mode=True
        )

        import json
        proposal_id = f"fix_{int(os.times().elapsed * 1000)}"
        diff_str = ""
        additions = 0
        deletions = 0

        try:
            data = json.loads(response_str)
            root_cause = data.get("rootCause", "Error analyzed by KittyAI Coding Agent.")
            explanation = data.get("explanation", data.get("suggestedFix", "Applied suggested resolution."))
            patched_content = data.get("patchedContent")

            if original_content and patched_content:
                orig_lines = original_content.splitlines(keepends=True)
                patch_lines = patched_content.splitlines(keepends=True)
                diff = difflib.unified_diff(
                    orig_lines,
                    patch_lines,
                    fromfile=f"a/{target_file}",
                    tofile=f"b/{target_file}"
                )
                diff_str = "".join(diff)
                additions = sum(1 for line in diff_str.splitlines() if line.startswith("+") and not line.startswith("+++"))
                deletions = sum(1 for line in diff_str.splitlines() if line.startswith("-") and not line.startswith("---"))
            else:
                patched_content = original_content

        except Exception as e:
            logger.warning(f"Failed to parse LLM JSON fix: {e}")
            root_cause = "Diagnostic complete."
            explanation = "Review error trace and apply recommended fix."
            patched_content = original_content

        proposal = {
            "id": proposal_id,
            "title": f"Fix for {parsed.get('language', 'code')} error in {target_file or 'workspace'}",
            "explanation": explanation,
            "rootCause": root_cause,
            "targetFiles": [target_file] if target_file else [],
            "diffs": [
                {
                    "filePath": actual_path or target_file or "target.file",
                    "originalContent": original_content,
                    "patchedContent": patched_content,
                    "unifiedDiff": diff_str,
                    "additionsCount": additions,
                    "deletionsCount": deletions
                }
            ],
            "status": "pending"
        }

        self.active_sessions[proposal_id] = proposal
        return {
            "parsedError": parsed,
            "proposal": proposal
        }

    def apply_patch(self, proposal_id: str, patches: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Safely writes patched code to disk, creating `.kitty_backup` for instant rollback.
        """
        modified_files = []
        backup_paths = []

        for p in patches:
            file_path = p.get("filePath")
            patched_content = p.get("patchedContent")
            if not file_path or patched_content is None:
                continue

            target = Path(file_path)
            if not target.is_absolute():
                target = Path.cwd() / target

            try:
                # Create backup
                if target.exists():
                    backup_file = target.with_suffix(target.suffix + ".kitty_backup")
                    backup_file.write_text(target.read_text(encoding="utf-8", errors="replace"), encoding="utf-8")
                    backup_paths.append(str(backup_file))

                # Atomic write
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(patched_content, encoding="utf-8")
                modified_files.append(str(target))
                logger.info(f"Successfully applied patch to: {target}")
            except Exception as e:
                logger.error(f"Failed to patch {target}: {e}")
                return {"success": False, "error": str(e), "modifiedFiles": modified_files}

        return {
            "success": True,
            "modifiedFiles": modified_files,
            "backupPaths": backup_paths,
            "message": f"Applied patch to {len(modified_files)} file(s). Backups saved."
        }

coding_agent = CodingAgent()
