# SCI Songwriting Engine — Quick Reference Card

## 🚀 Quick Start (One Command)

```bash
cd ~/sci-songwriting-engine
bash START.sh
```

Then open: **http://localhost:3000**

---

## 📋 What You Get

| Service | Port | URL | Status |
|---------|------|-----|--------|
| Frontend (Vite) | 3000 | http://localhost:3000 | 🌐 UI |
| Backend (Node.js) | 3001 | http://localhost:3001/api/health | ⚙️ API |
| ML Service (Python) | 3002 | http://localhost:3002/ml/health | 🤖 Optional |

---

## 🧪 Test Everything

```bash
bash TEST_ENDPOINTS.sh
```

Expected: **6/6 tests pass ✅**

---

## 📂 New Feature Documents

1. **Journalling Features** → Introspection-driven identity capture
   ```bash
   cat docs/JOURNALLING_FEATURES.md
   ```

2. **Hook Book Songwriting** → Deliberate hook crafting
   ```bash
   cat docs/HOOK_BOOK_SONGWRITING.md
   ```

3. **Complete Guide** → Business + technical overview
   ```bash
   cat docs/COMPLETE_GUIDE.md
   ```

---

## 🔍 Endpoints Summary

All endpoints are **tested and working** ✅

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Analyze Identity
```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "whoAreYouNot": "I am not a victim",
      "emotionalTruth": "I carry rage and hope",
      "socialConflict": "The world tells me to be small",
      "mainIdea": "I will rise"
    }
  }'
```

### List Sessions
```bash
curl http://localhost:3001/api/sessions
```

### Save Session
```bash
curl -X POST http://localhost:3001/api/save \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {"archetype": "Defiant"},
    "timestamp": '$(date +%s)'
  }'
```

---

## 📊 Architecture in 30 Seconds

```
User Journal Entry
    ↓
Identity Analysis (Engine)
    ↓
Persona Detection (8 archetypes)
    ↓
Hook Book Strategy
    ↓
Song Structure Planning
    ↓
AI Generation (Claude/OpenAI)
    ↓
🎵 SONG
```

---

## 🛠️ Useful Commands

### Kill all services
```bash
pkill -f "npm start" && pkill -f "python3 app.py"
```

### Watch logs
```bash
tail -f /tmp/sci-backend.log     # Backend
tail -f /tmp/sci-ml.log          # ML Service
tail -f /tmp/sci-frontend.log    # Frontend
```

### Check running processes
```bash
ps aux | grep -E "npm|python3|node" | grep -v grep
```

### Clear saved sessions
```bash
rm -rf ~/.sci-sessions/*
```

---

## 📖 Reading Order

1. **This file** (you are here)
2. [docs/JOURNALLING_FEATURES.md](docs/JOURNALLING_FEATURES.md)
3. [docs/HOOK_BOOK_SONGWRITING.md](docs/HOOK_BOOK_SONGWRITING.md)
4. [docs/COMPLETE_GUIDE.md](docs/COMPLETE_GUIDE.md)
5. [docs/architecture.md](docs/architecture.md)

---

## ✅ Verification Checklist

- [ ] `bash START.sh` runs without errors
- [ ] Frontend loads at http://localhost:3000
- [ ] Backend responds at http://localhost:3001/api/health
- [ ] `bash TEST_ENDPOINTS.sh` shows 6/6 passed
- [ ] Can save a session to ~/.sci-sessions/
- [ ] Read all 3 feature documents
- [ ] Generated a test song

---

## 🎯 Key Concepts

| Concept | Meaning |
|---------|---------|
| **Identity Excavation** | Surfacing truth through confrontational questions |
| **Persona** | Archetype + voice + emotional profile |
| **Hook** | Lyrical/melodic phrase that anchors song + identity |
| **Journalling** | Rapid-capture emotional truth that feeds engine |
| **PIRE** | Past/Present/Future temporal conflict detection |
| **Code-switching** | EN ↔ SW ↔ SH language mix reflection |
| **Rawness** | Vulnerability slider (0=polished → 100=unfiltered) |

---

## 🚨 Common Issues

**Q: Backend won't start**  
A: Check `.env` file exists in `backend/` folder with `PORT=3001`

**Q: Port 3001 already in use**  
A: `lsof -i :3001` to find process, then `kill -9 <PID>`

**Q: Tests fail**  
A: Make sure backend is running: `cd backend && npm start`

**Q: ML Service not starting**  
A: It's optional. Tests still pass without it.

---

## 📞 Quick Commands

```bash
# One-line startup
cd ~/sci-songwriting-engine && bash START.sh

# One-line test
cd ~/sci-songwriting-engine && bash TEST_ENDPOINTS.sh

# Kill everything gracefully
pkill -TERM -f "npm start"; pkill -TERM -f "python3 app.py"

# Fresh start (option 1)
bash START.sh

# Fresh start (option 2 - verbose)
cd backend && npm start &
cd frontend && npm run dev &
cd ml-service && python3 app.py &
```

---

## 🎵 Next: Using the Engine

1. **Open** http://localhost:3000
2. **Paste** your Anthropic API key
3. **Answer** identity questions (7 prompts)
4. **Review** persona + song structure
5. **Generate** section-by-section
6. **Download** your excavated song

---

*All systems operational. Ready to build from identity insights. — April 21, 2026*
