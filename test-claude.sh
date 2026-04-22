#!/bin/bash
# test-claude.sh — Test Claude API connectivity
# Usage: ./test-claude.sh <API_KEY> [model] [backend_url]

set -e

API_KEY="${1:-}"
MODEL="${2:-claude-sonnet-4-6}"
BACKEND="${3:-http://localhost:3001}"

if [ -z "$API_KEY" ]; then
  echo "❌ Usage: ./test-claude.sh <API_KEY> [model] [backend_url]"
  echo ""
  echo "Example:"
  echo "  ./test-claude.sh sk-ant-v7-xxxxxxxxxxxxxxxx"
  echo "  ./test-claude.sh sk-ant-v7-xxxxxxxxxxxxxxxx claude-haiku-4-5-20251001"
  echo ""
  echo "Available models:"
  echo "  - claude-sonnet-4-6 (recommended, default)"
  echo "  - claude-haiku-4-5-20251001 (fast, cheap)"
  echo "  - claude-opus-4-6 (highest quality, requires Pro)"
  exit 1
fi

echo "🧪 Testing Claude API Connectivity"
echo "────────────────────────────────────"
echo "Backend:  $BACKEND"
echo "Model:    $MODEL"
echo "API Key:  ${API_KEY:0:8}...${API_KEY: -8}"
echo ""

# Check if backend is running
echo "1️⃣  Checking backend health..."
if ! curl -s "$BACKEND/api/health" > /dev/null 2>&1; then
  echo "❌ Backend is not running on $BACKEND"
  echo "   Start it with: npm run dev:backend"
  exit 1
fi
echo "✅ Backend is healthy"
echo ""

# Test Claude API
echo "2️⃣  Testing Claude API with diagnostic endpoint..."
RESPONSE=$(curl -s -X POST "$BACKEND/api/test-claude" \
  -H "Content-Type: application/json" \
  -d "{\"apiKey\": \"$API_KEY\", \"model\": \"$MODEL\"}")

echo "Response:"
echo "$RESPONSE" | node -e "const fs = require('fs'); const data = JSON.parse(fs.readFileSync(0, 'utf-8')); console.log(JSON.stringify(data, null, 2));"
echo ""

# Parse success field
SUCCESS=$(echo "$RESPONSE" | node -e "const fs = require('fs'); const data = JSON.parse(fs.readFileSync(0, 'utf-8')); console.log(data.success)")

if [ "$SUCCESS" = "true" ]; then
  echo "✅ Claude API is working correctly!"
  echo ""
  echo "You can now:"
  echo "  1. Return to the Landing screen"
  echo "  2. Paste your API key again"
  echo "  3. Try generating a song"
else
  echo "❌ Claude API test failed. Check the error details above."
  echo ""
  echo "Common issues:"
  echo "  • Invalid or expired API key"
  echo "  • API key was revoked"
  echo "  • Wrong model name"
  echo "  • Account has insufficient balance"
  echo "  • Rate limit exceeded (try again in a moment)"
  exit 1
fi
