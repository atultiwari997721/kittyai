# Meeting Agent & Security Policies

## 1. Meeting Delegation Policy
- **Explicit Consent**: Default state is OFF. Meeting delegation must be explicitly enabled by the user in Settings.
- **Identification**: When attending on user behalf, KritiAI identifies itself as an autonomous AI assistant and never impersonates the human user.
- **Consent Compliance**: Recording and transcription comply with meeting participant consent requirements.
- **Summary & Action Items**: Generates executive summaries, key decisions, and assigns action items to respective owners.

## 2. CommandPolicyEngine & Terminal Security
All terminal executions are classified prior to execution:
- **LOW**: Safe read operations (`git status`, `npm test`, `dir`, `echo`).
- **MEDIUM**: Code builds and installations (`npm install`, `pip install`). Requires confirmation.
- **HIGH**: File changes, system modifications. Requires confirmation.
- **CRITICAL**: Destruction commands (`format`, `del /s /q c:`, registry modifications). Blocked unconditionally.
