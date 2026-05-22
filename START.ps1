# Habitat — Windows PowerShell startup
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Habitat — startup (Windows)" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════"

function Require-Cmd($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Missing required command: $name"
  }
}

Require-Cmd node
Require-Cmd npm
Require-Cmd python

Write-Host "Node: $(node -v)"
Write-Host "Python: $(python --version 2>&1)"

if (-not (Test-Path "backend\node_modules")) {
  npm install --prefix backend
}
if (-not (Test-Path "frontend\node_modules")) {
  npm install --prefix frontend
}
if (-not (Test-Path "frontend\dist")) {
  npm run build --prefix frontend
}

pip install -r ml-service\requirements.txt -q

if ((Test-Path ".env.example") -and -not (Test-Path "backend\.env")) {
  Copy-Item .env.example backend\.env
}

$ml = Start-Process python -ArgumentList "ml-service\app.py" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 3
$be = Start-Process node -ArgumentList "backend\server.js" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 2
$fe = Start-Process npx -ArgumentList "serve","frontend\dist","-l","3000" -PassThru -WindowStyle Hidden

Write-Host ""
Write-Host "Services started (background):" -ForegroundColor Green
Write-Host "  ML:       http://localhost:3002  (pid $($ml.Id))"
Write-Host "  Backend:  http://localhost:3001  (pid $($be.Id))"
Write-Host "  Frontend: http://localhost:3000  (pid $($fe.Id))"
Write-Host ""
Write-Host "Open http://localhost:3000 in your browser."
