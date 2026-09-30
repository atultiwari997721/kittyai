@echo off
title KritiAI - Autonomous Personal AI Operating System - Windows Launcher
color 0B
cls
echo ===================================================================
echo             ⚡ KritiAI - Personal AI Operating System
echo        "Your Personal AI That Gets Things Done."
echo ===================================================================
echo.

set PORT=9972
if "%1"=="99772" (
    echo [INFO] TCP port numbers are standardly limited between 1 and 65535.
    echo [INFO] Automatically mapping requested port 99772 to port 9972.
    set PORT=9972
) else if not "%1"=="" (
    set PORT=%1
)

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
    echo [INFO] Local Ollama not running. Cloud AI fallback active.
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
echo [4/4] Launching KritiAI Web & Desktop App on Default Port %PORT%...
where npm >nul 2>nul
if %errorlevel% equ 0 (
    if exist "package.json" (
        start "KritiAI App Server (Port %PORT%)" /min npm run dev -- --port %PORT%
    )
)
timeout /t 3 /nobreak >nul
start http://localhost:%PORT%

echo.
echo ===================================================================
echo  KritiAI is now actively running!
echo  Default Port: %PORT% (http://localhost:%PORT%)
echo  Assist Mode & Global Shortcut: Ctrl+Shift+Space (or Alt+K)
echo  Local Sidecar API: http://127.0.0.1:8000/api/health
echo ===================================================================
timeout /t 8
