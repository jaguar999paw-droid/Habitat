#!/bin/bash
# startup.sh — SCI ML Service launcher
cd ~/Habitat/ml-service
echo "[SCI-ML] Installing dependencies..."
pip3 install -r requirements.txt --break-system-packages -q
echo "[SCI-ML] Launching Flask ML service on port 3002..."
python3 app.py &
echo "[SCI-ML] ML service started (PID $!)"
