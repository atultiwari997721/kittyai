# Google OAuth & Integration Guide for KritiAI

KritiAI integrates with official Google APIs to provide autonomous email drafting, calendar scheduling, and Drive file inspection.

## 1. Google Cloud Project Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `KritiAI-Workspace`.
3. Enable the following APIs:
   - **Gmail API**
   - **Google Calendar API**
   - **Google Drive API**

## 2. OAuth Consent Screen Configuration
- **User Type**: External (or Internal if G-Suite/Google Workspace).
- **App Name**: `KritiAI`
- **User Support Email**: Your administrator email.
- **Developer Contact**: `admin@kritiai.io`

### Required Scopes:
| Scope | Purpose |
|---|---|
| `https://www.googleapis.com/auth/gmail.compose` | Drafting emails on user behalf |
| `https://www.googleapis.com/auth/gmail.send` | Authorized email dispatch |
| `https://www.googleapis.com/auth/calendar.events` | Scheduling and conflict detection |
| `https://www.googleapis.com/auth/drive.readonly` | Inspecting authorized documents |

## 3. Credentials & Redirect URIs
1. Create OAuth 2.0 Client ID (Web Application).
2. Authorized JavaScript Origins:
   - `http://localhost:5173`
   - `https://kritiai.vercel.app`
3. Authorized Redirect URIs:
   - `http://localhost:5173/api/auth/google/callback`
   - `https://kritiai.vercel.app/api/auth/google/callback`

## 4. Security Principle: Incremental Authorization
KritiAI separates **Login Identification** from **Service Authorization**:
- Logging in identifies the user account.
- Gmail, Calendar, and Drive access are connected individually under **Settings ➔ Integrations**.
- Tokens are encrypted and never exposed to client-side frontend code.
