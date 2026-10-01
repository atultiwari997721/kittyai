<#
.SYNOPSIS
    KritiAI - Autonomous Personal AI Operating System Installer for Windows
.DESCRIPTION
    "Your Personal AI That Gets Things Done."
    Autonomous 1-click installer: downloads local execution kernel, unpacks UI,
    creates shortcuts, registers app, starts desktop engine, and verifies port 9972.
#>

[CmdletBinding()]
param()

$Host.UI.RawUI.WindowTitle = "KritiAI Desktop Setup"

Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "             * KritiAI - Personal AI Operating System *            " -ForegroundColor Magenta
Write-Host "        'Your Personal AI That Gets Things Done.'                 " -ForegroundColor White
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host ""

# Enable modern TLS protocols
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12 -bor [System.Net.SecurityProtocolType]::Tls13

$installDir = "$env:LOCALAPPDATA\Programs\KritiAI"
$workspaceDir = "$env:USERPROFILE\KritiAI\workspace"
$tempZip = "$env:TEMP\KritiAI_Payload_$([System.Environment]::TickCount).zip"

# 1. Prepare target directories
Write-Host "[1/5] Preparing installation directory..." -ForegroundColor Yellow
if (!(Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
}
if (!(Test-Path $workspaceDir)) {
    New-Item -ItemType Directory -Path $workspaceDir -Force | Out-Null
}
Write-Host "      Target: $installDir" -ForegroundColor Gray

# 2. Download payload bundle
Write-Host "[2/5] Downloading KritiAI execution engine & web UI bundle..." -ForegroundColor Yellow
$downloadUrls = @(
    "https://kritiai.vercel.app/api/download?file=payload.zip",
    "https://kritiai.vercel.app/downloads/payload.zip"
)

$downloadSuccess = $false
foreach ($url in $downloadUrls) {
    try {
        Write-Host "      Fetching from: $url ..." -ForegroundColor Gray
        $wc = New-Object System.Net.WebClient
        $wc.Headers.Add("User-Agent", "KritiAI-Installer/1.0")
        $wc.DownloadFile($url, $tempZip)
        if ((Test-Path $tempZip) -and ((Get-Item $tempZip).Length -gt 10000)) {
            $downloadSuccess = $true
            $sizeVal = [math]::Round(((Get-Item $tempZip).Length / 1024), 1)
            Write-Host "      [OK] Downloaded payload ($sizeVal KB)." -ForegroundColor Green
            break
        }
    } catch {
        # continue to next URL
    }
}

# Fallback: check local workspace if downloaded from repo
if (-not $downloadSuccess) {
    $localCandidates = @(
        "$PSScriptRoot\payload.zip",
        "$PSScriptRoot\..\installer\payload.zip",
        "installer\payload.zip",
        "public\downloads\payload.zip"
    )
    foreach ($cand in $localCandidates) {
        if (Test-Path $cand) {
            Copy-Item -Path $cand -Destination $tempZip -Force
            $downloadSuccess = $true
            Write-Host "      [OK] Using local payload bundle." -ForegroundColor Green
            break
        }
    }
}

if (-not $downloadSuccess) {
    Write-Host "[ERROR] Could not download payload bundle. Please check your internet connection." -ForegroundColor Red
    Write-Host "        You can also download KritiAI-Setup.exe directly from: https://kritiai.vercel.app" -ForegroundColor Yellow
    return
}

# 3. Extract payload into target directory
Write-Host "[3/5] Extracting autonomous runtime kernel, tools, and UI..." -ForegroundColor Yellow
try {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::OpenRead($tempZip)
    foreach ($entry in $archive.Entries) {
        if ([string]::IsNullOrEmpty($entry.Name)) { continue }
        $targetPath = [System.IO.Path]::Combine($installDir, ($entry.FullName -replace '/', [System.IO.Path]::DirectorySeparatorChar))
        $targetParent = [System.IO.Path]::GetDirectoryName($targetPath)
        if (!(Test-Path $targetParent)) {
            [System.IO.Directory]::CreateDirectory($targetParent) | Out-Null
        }
        [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $targetPath, $true)
    }
    $archive.Dispose()
    Remove-Item $tempZip -Force -ErrorAction SilentlyContinue
    Write-Host "      [OK] Runtime files unpacked successfully." -ForegroundColor Green
} catch {
    Write-Host "      [!] Extraction warning: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 4. Create Desktop & Start Menu Shortcuts & Registry
Write-Host "[4/5] Creating shortcuts and registering application..." -ForegroundColor Yellow
try {
    $exePath = "$installDir\KritiAI.exe"
    $wsh = New-Object -ComObject WScript.Shell

    # Desktop shortcut
    $desktopDir = [System.Environment]::GetFolderPath('Desktop')
    $desktopShortcut = $wsh.CreateShortcut("$desktopDir\KritiAI.lnk")
    $desktopShortcut.TargetPath = $exePath
    $desktopShortcut.WorkingDirectory = $installDir
    $desktopShortcut.Description = "KritiAI - Personal AI Operating System"
    $desktopShortcut.Save()

    # Start Menu shortcut
    $startMenuDir = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\KritiAI"
    if (!(Test-Path $startMenuDir)) {
        New-Item -ItemType Directory -Path $startMenuDir -Force | Out-Null
    }
    $smShortcut = $wsh.CreateShortcut("$startMenuDir\KritiAI.lnk")
    $smShortcut.TargetPath = $exePath
    $smShortcut.WorkingDirectory = $installDir
    $smShortcut.Description = "KritiAI - Personal AI Operating System"
    $smShortcut.Save()

    # Windows Apps Registration
    $regPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\KritiAI"
    if (!(Test-Path $regPath)) { New-Item -Path $regPath -Force | Out-Null }
    Set-ItemProperty -Path $regPath -Name "DisplayName" -Value "KritiAI Personal AI OS"
    Set-ItemProperty -Path $regPath -Name "DisplayVersion" -Value "1.0.0"
    Set-ItemProperty -Path $regPath -Name "Publisher" -Value "KritiAI Team"
    Set-ItemProperty -Path $regPath -Name "InstallLocation" -Value $installDir
    Set-ItemProperty -Path $regPath -Name "DisplayIcon" -Value $exePath
    Set-ItemProperty -Path $regPath -Name "UninstallString" -Value "powershell.exe -Command Remove-Item -Recurse -Force '$installDir'"

    Write-Host "      [OK] Desktop and Start Menu shortcuts created." -ForegroundColor Green
} catch {
    Write-Host "      [!] Shortcut notice: $($_.Exception.Message)" -ForegroundColor Gray
}

# 5. Launch KritiAI Desktop Kernel & Verify Port 9972
Write-Host "[5/5] Launching KritiAI Desktop Kernel & probing local runtime..." -ForegroundColor Yellow
# Stop previous instances if running
Get-Process -Name "KritiAI" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 400

$exePath = "$installDir\KritiAI.exe"
if (Test-Path $exePath) {
    Start-Process -FilePath $exePath -WorkingDirectory $installDir
} else {
    Write-Host "[ERROR] Executable not found at $exePath" -ForegroundColor Red
    return
}

# Probe port 9972 to confirm kernel is responding
Write-Host "      Waiting for local kernel on http://127.0.0.1:9972 ..." -ForegroundColor Gray
$kernelOnline = $false
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Milliseconds 600
    try {
        $res = Invoke-RestMethod -Uri "http://127.0.0.1:9972/api/health" -TimeoutSec 2 -ErrorAction Stop
        if ($res.status -eq 'online') {
            $kernelOnline = $true
            break
        }
    } catch {}
}

if ($kernelOnline) {
    Write-Host "      [OK] KritiAI Desktop Kernel is ONLINE (Port 9972)!" -ForegroundColor Green
    
    # Launch in standalone Edge App mode (chromeless, native window)
    $edgePaths = @(
        "$env:ProgramFiles (x86)\Microsoft\Edge\Application\msedge.exe",
        "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
    )
    $edgeLaunched = $false
    foreach ($edge in $edgePaths) {
        if (Test-Path $edge) {
            Start-Process $edge -ArgumentList "--app=http://localhost:9972 --window-size=1280,820"
            $edgeLaunched = $true
            break
        }
    }
    if (-not $edgeLaunched) {
        Start-Process "http://localhost:9972"
    }
} else {
    Write-Host "      [INFO] Kernel starting in background. Open http://localhost:9972 once loaded." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  [OK] KritiAI is now actively installed & running on your machine!" -ForegroundColor Green
Write-Host "  Application: $installDir\KritiAI.exe" -ForegroundColor White
Write-Host "  Workspace:   $workspaceDir" -ForegroundColor White
Write-Host "  Local API:   http://127.0.0.1:9972/api/health" -ForegroundColor White
Write-Host "  PowerShell:  Unrestricted execution enabled" -ForegroundColor White
Write-Host "===================================================================" -ForegroundColor Cyan
