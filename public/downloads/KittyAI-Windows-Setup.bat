@echo off
title KittyAI Autonomous Personal Assistant - Windows Launcher
color 0B
cls
echo ===================================================================
echo             🐱 KittyAI / KritiAI Personal Assistant
echo        Local-First Autonomous Multi-Agent Desktop Engine
echo ===================================================================
echo.
echo [1/3] Checking local dependencies...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Python 3.10+ is required for the local AI sidecar.
    echo Please install Python from https://python.org and re-run this setup.
    pause
    exit /b 1
)

echo [2/3] Initializing KittyAI background sidecar on http://127.0.0.1:8000...
cd /d "%~dp0..\.."
start "KittyAI Sidecar" /min python sidecar/python/main.py

echo [3/3] Launching KittyAI Desktop UI...
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo ===================================================================
echo  KittyAI is now actively running in the background!
echo  Transparent Assist HUD Hotkey: Alt+K
echo  Local API: http://127.0.0.1:8000/api/health
echo ===================================================================
timeout /t 5
