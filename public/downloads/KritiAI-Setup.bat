@echo off
title KritiAI - Autonomous Personal AI Operating System - Windows Launcher
color 0B
cls
echo ===================================================================
echo             ⚡ KritiAI - Personal AI Operating System
echo        "Your Personal AI That Gets Things Done."
echo ===================================================================
echo.
echo [1/4] Checking Python runtime...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Python 3.10+ is recommended for the local AI sidecar.
    echo Opening Python installation guide...
    start https://python.org
) else (
    echo [OK] Python runtime detected.
)

echo.
echo [2/4] Checking Ollama local AI runtime...
curl -s http://127.0.0.1:11434/api/version >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Local Ollama not running. You can run Ollama for offline privacy.
) else (
    echo [OK] Ollama local AI is ONLINE.
)

echo.
echo [3/4] Launching KritiAI Intelligence Sidecar on http://127.0.0.1:8000...
cd /d "%~dp0..\.."
if exist "sidecar\python\main.py" (
    start "KritiAI Sidecar" /min python sidecar/python/main.py
)

echo.
echo [4/4] Opening KritiAI Desktop Workspace...
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo ===================================================================
echo  KritiAI is now actively running in the background!
echo  Assist Mode & Global Shortcut: Ctrl+Shift+Space (or Alt+K)
echo  Local API: http://127.0.0.1:8000/api/health
echo ===================================================================
timeout /t 6
