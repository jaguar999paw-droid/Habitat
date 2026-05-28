# HABITAT — AGENT HANDOFF DOCUMENT
**Date:** May 3, 2026  
**Project:** Habitat (identity-mapping songwriting engine)  
**Location:** `/home/kamau/Habitat`  
**Status:** Phases 1–7 complete. All originally missing items built and tested. App is routing through CockpitV5. Ready for Phase 8: component cleanup + Sheng NLP.

---

## 1. WHAT THIS PROJECT IS

Habitat is an identity-mapping songwriting engine for East Africa (Nairobi-first, EN/SW/Sheng). It excavates a user's authentic identity through journal entries, hook strategies, and persona sliders — then generates deeply personal song lyrics via Claude/OpenAI. If no API key is present, it falls back to rule-based generation.

**Core identity intelligence loop (KOKI directive — active):**
```
Journal → Hook extraction → Hook Book → Identity mapping → Generation → Feedback → Identity drift
```

**Running services:**

| Service | Port | Start command |
|---|---|---|
| Frontend (Vite/React) | 3000 | `cd frontend && npm run dev` |
| Backend (Express) | 3001 | `cd backend && node server.js` |
| ML Service (Python/Flask) | 3002 | `cd ml-service && python3 app.py` (optional) |

**One-command start:** `bash ~/Habitat/START.sh`

---

## 2. WHAT WAS BUILT THIS SESSION (May 3, 2026)

### Priority 4 — ✅ GET /api/identity/drift endpoint (DONE)

Added to `backend/routes/identityRoutes.js`:

```
GET /api/identity/drift?sessionA=<timestamp>[&sessionB=<timestamp>]
```

- Loads two session files from `~/.habitat-sessions/`
- If `sessionB` is omitted, compares `sessionA` against the most recent session
- Returns: `{ drift, trends, sessions }` where:
  - `drift` = `computeDrift()` output: `{ hasDrift, deltas, summary, elapsed_days }`
  - `trends` = `getTrend()` for `emotion_intensity`, `conflict_score`, `trait_count` across ALL sessions
  - Returns 422 if sessions lack `identity_snapshot` (pre-May 2026 saves)
- **Tested and live on port 3001**

### Priority 6 — ✅ App.jsx routing updated (DONE)

`frontend/src/App.jsx` updated to v2.3:

- Steps 2+3 (HookWorksheet + old Cockpit) **replaced** with single `step === 2 → CockpitV5`
- CockpitV5 now accepts `preFill` and `onDone` props
- `onDone` emits `{ persona, identity, hooks, identityProfile, journalEntry }` to App
- Step numbering: 0=Landing, 1=Journal, **2=CockpitV5**, 3=CockpitPreview, 4=Generator, 5=SongDisplay

### CockpitV5 — prop wiring (DONE)

`frontend/src/pages/CockpitV5.jsx` patched:
- Added `{ preFill = null, onDone = () => {} }` props
- `preFill` applied via `useEffect` on mount
- `handleProceed()` builds answers payload and calls `onDone()`
- **"Generate Song →"** button added above PersonaLiveBar
- CSS: `.proceedBar` + `.proceedBtn` added to `CockpitV5.module.css` (brand green `#2D6A4F`)

### recharts — ✅ installed in frontend

`recharts` was missing from `frontend/package.json`. Installed. Frontend now builds clean (✓ built in 31s).

---

## 3. CURRENT COMPLETE STATUS

### All endpoints — verified live

| Endpoint | Status |
|---|---|
| `GET /api/health` | ✅ |
| `POST /api/analyze` | ✅ |
| `POST /api/generate` | ✅ |
| `POST /api/section` | ✅ |
| `POST /api/save` | ✅ + identity_snapshot |
| `GET /api/sessions` | ✅ |
| `POST /api/delta` | ✅ |
| `POST /api/journal/entries` | ✅ |
| `GET /api/journal/entries` | ✅ |
| `POST /api/journal/synthesize` | ✅ auto-extracts hooks |
| `GET /api/hookbook/hooks` | ✅ |
| `GET /api/hookbook/profile` | ✅ |
| `POST /api/hookbook/hooks/:id/lock` | ✅ |
| `GET/POST /api/identity/config` | ✅ |
| `POST /api/identity/6angle-profile` | ✅ |
| `POST /api/identity/unbiased-assessment` | ✅ |
| `GET /api/identity/drift` | ✅ **NEW** |

### Frontend components — all present

| Component | Status |
|---|---|
| `CockpitV5.jsx` | ✅ wired with onDone + preFill |
| `HookField.jsx` | ✅ (reservoir/extraction/insight modes) |
| `EmotionTimeline.jsx` | ✅ |
| `TraitDistribution.jsx` | ✅ |
| `LanguageMixChart.jsx` | ✅ |
| `CoherenceScoreMeter.jsx` | ✅ |
| `KnobSlider.jsx` | ✅ |
| `PersonaLiveBar.jsx` | ✅ |

---

## 4. WHAT IS STILL NEEDED — NEXT AGENT

### Priority 1 — Frontend component cleanup (1–2 hours)

| Current | Target | Action |
|---|---|---|
| `IdentitySliders.jsx` | `KnobSlider.jsx` | Find all usages of IdentitySliders in other pages and replace; delete IdentitySliders.jsx |
| `PersonaCard.jsx` | `PersonaLiveBar.jsx` | Find all usages of PersonaCard and replace; delete PersonaCard.jsx |
| `EmotionGrid.jsx` | Same file | Add `multiSelect?: boolean` prop — currently always multi |
| `IdentityRadar.jsx` | Same file | Fix label overlap and tooltip clipping (recharts issue) |

Check for usages: `grep -rn "IdentitySliders\|PersonaCard" frontend/src/`

### Priority 2 — Archive old pages (30 min)

These pages are superseded by CockpitV5 but still in the filesystem:
- `HookWorksheet.jsx` / `.module.css` → move to `frontend/src/archive/`
- `Cockpit.jsx` / `.module.css` → move to `frontend/src/archive/`

App.jsx no longer imports them but they're still imported nowhere — just clutter. Confirm first:
```bash
grep -rn "HookWorksheet\|from.*Cockpit'" frontend/src/App.jsx
```

### Priority 3 — Sheng/Swahili NLP (research + implementation, 3–4 hours)

The `language_mix` property exists in the identity schema and is passed to the prompt, but no phonetic or lexical models exist for Swahili/Sheng. Investigate:
- `afrikit` Python package (Swahili NLP)
- Masakhane NLP resources
- Sheng slang wordlists (open datasets)

Target: a lightweight `ml-service/modules/language/sheng_analyzer.py` that can:
1. Detect EN/SW/Sheng ratio in input text
2. Return `{ ratio: { en, sw, sheng }, flagged_slang: [] }`

### Priority 4 — Real EmotionTimeline data (1 hour)

`EmotionTimeline.jsx` currently renders with hardcoded demo data. Wire it to:
```
GET /api/journal/entries
```
Map the last 7 entries' `emotions[]` arrays to the recharts LineChart.

---

## 5. HARD CONSTRAINTS (NEVER VIOLATE)

- **CommonJS only** (`require/module.exports`). No ESM (`import/export`).
- **No Tailwind** — CSS Modules only (`.module.css` per component)
- **No SQLite/MongoDB** — `~/.habitat-sessions/` flat JSON is the persistence layer
- **ML service is optional** — all logic must work with ML offline
- **user input ALWAYS beats inference** — `source:'user'` is never overwritten by `source:'inferred'`
- **Do NOT touch** `/api/analyze`, `/api/generate`, `/api/section`, `/api/save`, `/api/sessions`, `/api/delta` core behavior
- **recharts** is available in frontend (now installed); use for all chart components

---

## 6. FILE MAP

```
Habitat/
├── backend/
│   ├── server.js                    ✅ routes mounted, fallback wired
│   └── routes/
│       ├── journalRoutes.js         ✅ persistence + hookExtractor auto-wired
│       ├── hookbookRoutes.js        ✅ /profile + /hooks + /hooks/:id/lock
│       └── identityRoutes.js        ✅ + /drift NEW
├── engine/
│   ├── identityParser.js            ✅
│   ├── hookExtractor.js             ✅
│   ├── hookIdentityMapper.js        ✅
│   ├── hookbookStore.js             ✅
│   ├── identityDrift.js             ✅ computeDrift / getTrend / buildIdentityVector
│   ├── rhymeGraph.js                ✅
│   └── metrics.js                   ✅
├── frontend/src/
│   ├── App.jsx                      ✅ v2.3 — CockpitV5 at step 2
│   ├── pages/
│   │   ├── CockpitV5.jsx            ✅ wired with onDone + preFill + Generate button
│   │   ├── CockpitV5.module.css     ✅ + proceedBar/proceedBtn
│   │   └── [all others]             ✅
│   └── components/
│       ├── HookField.jsx            ✅
│       ├── EmotionTimeline.jsx      ✅ (demo data — needs real API wiring)
│       ├── TraitDistribution.jsx    ✅
│       ├── LanguageMixChart.jsx     ✅
│       ├── CoherenceScoreMeter.jsx  ✅
│       └── [all others]             ✅
└── ~/.habitat-sessions/
    ├── journal.json                 ✅
    ├── identity.json                ✅
    ├── hookbook.json                ✅
    └── session-*.json               ✅ with identity_snapshot
```

---

## 7. QUICK TEST LOOP

```bash
BASE="http://localhost:3001"

# Backend health
curl -s $BASE/api/health

# Journal entry + hook extraction
curl -s -X POST $BASE/api/journal/entries \
  -H "Content-Type: application/json" \
  -d '{"text":"I refuse to carry the weight they gave me.","emotions":["defiance"],"promptIdx":0}'

curl -s -X POST $BASE/api/journal/synthesize -H "Content-Type: application/json" -d '{}'

# Hookbook
curl -s $BASE/api/hookbook/hooks
curl -s $BASE/api/hookbook/profile

# Save a session (creates identity_snapshot)
curl -s -X POST $BASE/api/save \
  -H "Content-Type: application/json" \
  -d '{"parsed":{"emotions":[{"emotion":"defiance","intensity":0.8}],"conflicts":[],"traits":["bold"]},"persona":{"archetype":"Defiant"}}'

# Drift — list sessions first, pick two timestamps
curl -s $BASE/api/sessions | python3 -c "import sys,json; s=json.load(sys.stdin); [print(x['id']) for x in s.get('sessions',[])]"
# curl -s "$BASE/api/identity/drift?sessionA=<ts1>&sessionB=<ts2>"
```

---

*Generated by Claude on 2026-05-03. All code references verified against live running Habitat backend v3.1.*
