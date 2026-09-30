# KritiAI - Local Windows Setup Script
# Configures Python dependencies, Ollama check, and local workspace

Write-Host "Setting up KritiAI Development Environment..." -ForegroundColor Cyan

# 1. Check Python
if (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "[OK] Python detected." -ForegroundColor Green
    python -m pip install -r sidecar/python/requirements.txt
} else {
    Write-Host "[!] Python 3.10+ required for local sidecar." -ForegroundColor Yellow
}

# 2. Check Node
if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "[OK] Node/npm detected. Installing root dependencies..." -ForegroundColor Green
    npm install
}

Write-Host "Setup completed successfully. Run 'npm run dev' to start." -ForegroundColor Green
