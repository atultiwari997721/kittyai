# Windows Desktop & Screen Assist Guide for KritiAI

KritiAI transforms your Windows PC into an autonomous operating layer using a local Python sidecar and native Windows controls.

## 1. Hotkeys & Assist HUD
- **Summon Floating Assist HUD**: `Ctrl+Shift+Space` (or `Alt+K`)
- **Dismiss**: `Escape`

## 2. Windows OS Automation
KritiAI utilizes PyAutoGUI and official Windows Settings URIs (`ms-settings:`):
- **Theme Switcher**: `ms-settings:personalization-colors`
- **Audio Control**: Endpoint volume adjustments
- **App Launchers**: VS Code (`code .`), Chrome, File Explorer, Command Terminal

## 3. Screen Assist Mode
Assist Mode enables targeted window OCR and contextual debugging:
- **Default State**: OFF
- **Target Selection**: Specific window (e.g. VS Code, Chrome) or entire screen
- **Automatic Privacy Filters**:
  - Password Managers
  - Banking Applications
  - Private / Incognito Browser Windows
- **Visible Indicator**: A persistent banner indicates active monitoring with 1-click **Pause** and **Stop** controls.
