<#
.SYNOPSIS
    KritiAI - Autonomous Personal AI Operating System Installer for Windows
.DESCRIPTION
    "Your Personal AI That Gets Things Done."
    Sets up local Python sidecar, Ollama configuration, and desktop workspace.
#>

[CmdletBinding()]
param()

$Host.UI.RawUI.WindowTitle = "KritiAI Desktop Setup"
Clear-Host

Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "             ⚡ KritiAI - Personal AI Operating System            " -ForegroundColor Magenta
Write-Host "        'Your Personal AI That Gets Things Done.'                 " -ForegroundColor White
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Python
Write-Host "[1/4] Checking Python environment..." -ForegroundColor Yellow
$pythonInstalled = Get-Command python -ErrorAction SilentlyContinue
if ($null -eq $pythonInstalled) {
    Write-Host "[!] Python 3.10+ not detected. Recommended for local sidecar." -ForegroundColor Yellow
    Write-Host "    Install from: https://www.python.org/downloads/" -ForegroundColor Gray
} else {
    $pyVer = python --version 2>&1
    Write-Host "[OK] $pyVer detected." -ForegroundColor Green
}

# 2. Check Ollama
Write-Host "[2/4] Checking Ollama local AI runtime..." -ForegroundColor Yellow
try {
    $ollamaCheck = Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/version" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "[OK] Ollama is ONLINE ($($ollamaCheck.version)). Local inference enabled!" -ForegroundColor Green
} catch {
    Write-Host "[INFO] Ollama not currently running. Cloud AI fallback (OpenAI/Gemini/NVIDIA/Groq) active." -ForegroundColor Gray
}

# 3. Initialize Sidecar
Write-Host "[3/4] Initializing KritiAI Intelligence Sidecar on port 8000..." -ForegroundColor Yellow
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sidecarMain = Join-Path $scriptDir "..\..\sidecar\python\main.py"

if (Test-Path $sidecarMain) {
    Start-Process -FilePath "python" -ArgumentList "`"$sidecarMain`"" -WindowStyle Minimized
    Write-Host "[OK] Sidecar process started in background." -ForegroundColor Green
} else {
    Write-Host "[INFO] Sidecar will run via browser-native copilot engine." -ForegroundColor Gray
}

# 4. Open Desktop App
Write-Host "[4/4] Opening KritiAI workspace on port 9972..." -ForegroundColor Yellow
Start-Process "http://localhost:9972"


Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  KritiAI is now actively running!" -ForegroundColor Green
Write-Host "  Hotkey: Ctrl+Shift+Space (Assist HUD)" -ForegroundColor White
Write-Host "  Local API: http://127.0.0.1:8000/api/health" -ForegroundColor White
Write-Host "===================================================================" -ForegroundColor Cyan
Start-Sleep -Seconds 5
