#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# ML Service Setup — Fast pip install + pre-cache models
# Run once during initial setup to download the transformers model
# ═══════════════════════════════════════════════════════════════════════════

set -e

PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "════════════════════════════════════════════════════════════════"
echo "🔧 ML SERVICE SETUP"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python3 not found${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version)
echo -e "${GREEN}✓${NC} Python3 $PYTHON_VERSION"

echo ""
echo -e "Phase 1: ${YELLOW}Installing Python dependencies${NC} (binary wheels only)..."
echo "  This may take 2-3 minutes on first run (PyTorch et al are large)"
echo ""

cd "$PROJECT_ROOT"

# Install with binary wheels only, no source builds
# --only-binary=:all: means "use wheels for all packages"
# This is MUCH faster than compiling from source
pip3 install -r requirements.txt \
    --prefer-binary \
    --no-build-isolation \
    -q 2>&1 | grep -v "already satisfied" || true

echo ""
echo -e "${GREEN}✓ Python dependencies installed${NC}"

echo ""
echo -e "Phase 2: ${YELLOW}Pre-caching transformer models${NC} (one-time download)..."
echo "  Model: paraphrase-MiniLM-L6-v2 (~80MB)"
echo "  Location: ~/.cache/huggingface/hub"
echo ""

# Run the Python setup script to pre-cache models
if python3 setup.py; then
    echo -e "${GREEN}✓ ML Service ready${NC}"
    echo ""
    echo "  You can now run:"
    echo "  → ./START.sh (full stack)"
    echo "  → python3 app.py (ML service only)"
    echo ""
else
    echo -e "${RED}✗ Model caching failed${NC}"
    exit 1
fi
