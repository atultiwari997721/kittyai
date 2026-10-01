@echo off
title KritiAI Desktop App Launcher
color 0B
cd /d "%~dp0"
echo ===================================================================
echo             ⚡ Launching KritiAI Desktop Application
echo        "Your Personal AI That Gets Things Done."
echo ===================================================================
echo.
if exist "KritiAI.exe" (
    echo [OK] Launching native KritiAI executable...
    start "" "KritiAI.exe"
    exit /b 0
)
if exist "desktop\app.py" (
    echo [OK] Launching KritiAI desktop engine on port 9972...
    start "KritiAI Engine" /min python desktop\app.py
    timeout /t 2 /nobreak >nul
    if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
        start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:9972 --window-size=1280,820
        exit /b 0
    )
    if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
        start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:9972 --window-size=1280,820
        exit /b 0
    )
    start http://localhost:9972
    exit /b 0
)
echo [OK] Opening KritiAI in browser...
start http://localhost:9972
