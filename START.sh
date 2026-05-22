#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# Habitat — Complete Startup Script
# Starts: ML Service (Python Flask) → Backend (Node.js) → Frontend (Vite)
# ═══════════════════════════════════════════════════════════════════════════

set -e

PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_ROOT"

echo "════════════════════════════════════════════════════════════════"
echo "🎵 HABITAT — STARTUP SEQUENCE"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 1: Environment Validation
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[PHASE 1]${NC} Validating environment..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js${NC} $NODE_VERSION"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python3 not found${NC}"
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
echo -e "${GREEN}✓ Python3${NC} $PYTHON_VERSION"

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 2: Dependency Installation
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[PHASE 2]${NC} Installing dependencies..."

# Backend
if [ ! -d "$PROJECT_ROOT/backend/node_modules" ]; then
    echo -e "  Installing ${YELLOW}backend${NC} dependencies..."
    cd "$PROJECT_ROOT/backend"
    npm install --silent
    echo -e "  ${GREEN}✓ Backend dependencies${NC} installed"
fi

# Frontend
if [ ! -d "$PROJECT_ROOT/frontend/node_modules" ]; then
    echo -e "  Installing ${YELLOW}frontend${NC} dependencies..."
    cd "$PROJECT_ROOT/frontend"
    npm install --silent
    echo -e "  ${GREEN}✓ Frontend dependencies${NC} installed"
fi

# ML Service Python dependencies
echo -e "  Installing ${YELLOW}ML service${NC} Python dependencies..."
cd "$PROJECT_ROOT/ml-service"
pip3 install -r requirements.txt --break-system-packages -q 2>/dev/null || echo "    (ML deps may already be installed)"
echo -e "  ${GREEN}✓ ML service dependencies${NC} ready"

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 3: Service Startup
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[PHASE 3]${NC} Starting services..."
echo ""

cd "$PROJECT_ROOT"

# Kill any existing services on these ports
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down services...${NC}"
    kill $ML_PID 2>/dev/null || true
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}Services stopped.${NC}"
}
trap cleanup EXIT

# Start ML Service (port 3002)
echo -e "${YELLOW}→${NC} Starting ML Service (port 3002)..."
cd "$PROJECT_ROOT/ml-service"
python3 app.py > /tmp/sci-ml.log 2>&1 &
ML_PID=$!
echo -e "  ${GREEN}ML Service PID: $ML_PID${NC}"

# Wait for ML service to be ready
echo "  Waiting for ML service to initialize..."
for i in {1..30}; do
    if curl -s http://localhost:3002/ml/health > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓ ML Service ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "  ${RED}✗ ML Service failed to start (check /tmp/sci-ml.log)${NC}"
    fi
    sleep 1
done

echo ""

# Start Backend (port 3001)
echo -e "${YELLOW}→${NC} Starting Backend (port 3001)..."
cd "$PROJECT_ROOT/backend"
npm start > /tmp/sci-backend.log 2>&1 &
BACKEND_PID=$!
echo -e "  ${GREEN}Backend PID: $BACKEND_PID${NC}"

# Wait for backend to be ready
echo "  Waiting for backend to initialize..."
for i in {1..20}; do
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        HEALTH=$(curl -s http://localhost:3001/api/health | grep -o '"status":"[^"]*"')
        echo -e "  ${GREEN}✓ Backend ready${NC} ($HEALTH)"
        break
    fi
    if [ $i -eq 20 ]; then
        echo -e "  ${RED}✗ Backend failed to start (check /tmp/sci-backend.log)${NC}"
    fi
    sleep 1
done

echo ""

# Start Frontend (port 3000)
echo -e "${YELLOW}→${NC} Starting Frontend (port 3000)..."
cd "$PROJECT_ROOT/frontend"
npm run dev > /tmp/sci-frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "  ${GREEN}Frontend PID: $FRONTEND_PID${NC}"

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 4: Ready Screen
# ─────────────────────────────────────────────────────────────────────────────
echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✓ ALL SERVICES STARTED${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo -e "${BLUE}🌐 Frontend${NC}:   http://localhost:3000"
echo -e "${BLUE}⚙️  Backend${NC}:    http://localhost:3001"
echo -e "${BLUE}🤖 ML Service${NC}: http://localhost:3002"
echo ""
echo "Logs:"
echo -e "  ML Service:  ${YELLOW}tail -f /tmp/sci-ml.log${NC}"
echo -e "  Backend:     ${YELLOW}tail -f /tmp/sci-backend.log${NC}"
echo -e "  Frontend:    ${YELLOW}tail -f /tmp/sci-frontend.log${NC}"
echo ""
echo "Press Ctrl+C to stop all services."
echo "════════════════════════════════════════════════════════════════"
echo ""

# Keep script running
wait
