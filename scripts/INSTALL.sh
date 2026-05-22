#!/usr/bin/env bash
# Habitat — cross-platform installer (Linux, macOS, Git Bash on Windows)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "════════════════════════════════════════"
echo "  Habitat — install"
echo "════════════════════════════════════════"

OS="$(uname -s 2>/dev/null || echo unknown)"
case "$OS" in
  Linux*)  PLATFORM="linux" ;;
  Darwin*) PLATFORM="macos" ;;
  MINGW*|MSYS*|CYGWIN*) PLATFORM="windows-git-bash" ;;
  *)       PLATFORM="unix" ;;
esac
echo "Detected platform: $PLATFORM"

need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    exit 1
  fi
}

need node
need npm
need python3

echo "Node: $(node -v)"
echo "Python: $(python3 --version)"

npm install --prefix backend
if [ -d frontend ] && [ -f frontend/package.json ]; then
  npm install --prefix frontend
  npm run build --prefix frontend
fi

python3 -m pip install -r ml-service/requirements.txt --user -q 2>/dev/null \
  || python3 -m pip install -r ml-service/requirements.txt -q

if [ -f .env.example ] && [ ! -f backend/.env ]; then
  cp .env.example backend/.env
  echo "Created backend/.env from .env.example"
fi

echo ""
echo "Install complete. Start with:"
echo "  ./START.sh          (Linux / macOS / Git Bash)"
echo "  ./START.ps1         (Windows PowerShell)"
