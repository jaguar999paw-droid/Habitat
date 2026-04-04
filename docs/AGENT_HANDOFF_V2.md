# SCI v2 — Agent Handoff Document
**Branch:** `v2-cockpit-ml`
**Last agent session:** 2026-04-04
**Next task:** Build the Cockpit UI + CockpitPreview frontend components

---

## What Has Been Done

### ✅ Commit 1 — Engine Upgrades
**Files changed:** `engine/identityParser.js`, `engine/styleMapper.js`, `engine/structurePlanner.js`
**New file:** `engine/referenceAnalyzer.js`

- **`identityParser.js`** — now `async`. Calls the ML microservice at `http://localhost:3002/ml/analyze` with a 500ms timeout before falling back to rule-based keyword matching. New output fields: `mlUsed`, `mlConfidence`, `semanticProfile { emotionVector, conflictProbabilities, traitScores }`. Sheng lexicon expanded from 11 to 44 words; detection now requires ≥ 3 Sheng words (was `any`).
- **`styleMapper.js`** — `mapStyle()` now accepts an `overrides` object `{ rawness, rhymeScheme }`. `rawness` (0–100) maps to a prose descriptor: polished / honest / unfiltered. Cockpit slider connects directly to this.
- **`structurePlanner.js`** — three new section blueprint types: `verse_address_listener`, `spoken_word`, `call_and_response`. `applyEmotionWeighting()` added: high intensity + high energy → double-hook; vulnerability in top 2 emotions → `bridge_surrender` always injected; spiritual/streetwise archetypes → `call_and_response` before bridge.
- **`referenceAnalyzer.js`** (new) — pure JS, no deps. Accepts pasted reference text, extracts: rhyme scheme (AABB/ABAB/AAAA/FREE/ABCB), vocabulary level (elevated/street/mixed/neutral), tonal register (warm/cold/aggressive/melancholic). Output: `{ hasReference, rhymeScheme, vocabularyLevel, tone, styleInfluence }`.

---

### ✅ Commit 2 — ML Microservice
**New directory:** `ml-service/`

Files:
- `app.py` — Flask server, port 3002. Endpoints: `POST /ml/analyze`, `POST /ml/embed`, `GET /ml/health`. Warms up model at startup.
- `emotion_model.py` — cosine similarity vs 8 EMOTION_ANCHORS using `paraphrase-MiniLM-L6-v2` (80MB, CPU-safe for 3.8GB RAM).
- `conflict_model.py` — cosine similarity vs 8 CONFLICT_ANCHORS (same model singleton).
- `trait_model.py` — cosine similarity vs 6 TRAIT_ANCHORS.
- `language_model.py` — `langdetect` for EN/SW + custom 44-word Sheng lexicon (Sheng detected at ≥ 3 hits).
- `requirements.txt` — `sentence-transformers`, `scikit-learn`, `flask`, `flask-cors`, `numpy`, `langdetect`.
- `startup.sh` — installs deps + launches Flask in background.

**To start the ML service manually:**
```bash
cd ~/sci-songwriting-engine/ml-service
pip3 install -r requirements.txt --break-system-packages -q
python3 app.py &
curl -s http://localhost:3002/ml/health
```

---

### ✅ Commit 3 — Backend v2
**File changed:** `backend/server.js`, `package.json`

- `/api/analyze` is now **async**, calls `parseIdentity()` (which tries ML), accepts `overrides: { rawness, rhymeScheme, energyValue }` and `answers.referenceText`.
- `/api/section` now accepts `seed` integer — increments cause the AI to vary its approach.
- **New route `POST /api/save`** — saves full session JSON to `~/.sci-sessions/session-[timestamp].json`.
- **New route `GET /api/sessions`** — lists last 50 sessions (metadata only).
- `/api/health` now probes the ML service and reports its status.
- Root `package.json` `dev` script now launches BACKEND + FRONTEND + ML together via `concurrently`.

---

### ✅ Commit 4 — Frontend Theme + SongDisplay v2
**Files changed:** `frontend/src/styles/global.css`, `frontend/src/pages/SongDisplay.jsx`, `frontend/src/App.jsx`, `frontend/index.html`
**Files marked @deprecated:** `frontend/src/pages/Questionnaire.jsx`, `frontend/src/pages/PersonaReview.jsx`

- **`global.css`** — full token replacement: purple/violet → green (#00ff88) + magenta (#ff00aa) + B&W palette. Bebas Neue added as `--font-display`. CRT scanline texture on body. Green input focus glow. `ignite` keyframe animation defined.
- **`index.html`** — Bebas Neue added to Google Fonts import.
- **`SongDisplay.jsx`** — per-section `↺` regenerate button. Each click calls `POST /api/section` with an incremented `seed`. Save session button calls `POST /api/save`. Section type colours updated to new green/magenta palette.
- **`App.jsx`** — v1 routing kept intact (app still works end-to-end). Cockpit imports commented out with `TODO v2` comments so the next agent knows exactly where to uncomment. Provider saved to `localStorage`.
- **`Questionnaire.jsx` / `PersonaReview.jsx`** — `@deprecated` JSDoc added at top of each file.

---

## What Remains — Next Agent's Work

### 🔲 Priority 1 — Cockpit.jsx (largest task)
**File to create:** `frontend/src/pages/Cockpit.jsx` + `Cockpit.module.css`

Three-panel cockpit layout (see `docs/AGENT_PROMPT_V2.md` Part 1 for full spec):

| Panel | Content |
|-------|---------|
| LEFT — "WHO" | Identity rejection checkboxes (16 chips), visual archetype picker (8 cards), trait sliders: Poetic / Streetwise / Spiritual / Wounded |
| CENTRE — "WHAT" | Core message textarea, emotional truth field, social conflict field, reference drop zone |
| RIGHT — "HOW" | Energy slider, Rawness slider, Language toggle [EN][SW][SH], Perspective pills [1st][2nd][3rd], Rhyme swatches |

Top bar: `PersonaLiveBar` (updates every 500ms from state).
Bottom: Full-width `IGNITE →` button (Bebas Neue, green → magenta on hover, ignite animation on click).

**Required sub-components** (create in `frontend/src/components/`):
- `KnobSlider.jsx` + CSS — range input with rotation CSS animation
- `ArchetypeGrid.jsx` + CSS — 8 archetype cards (icon + label), single-select, green border on selected
- `LanguageToggle.jsx` + CSS — 3-button EN/SW/SH group, each independently on/off
- `RhymeSwatch.jsx` + CSS — 5 coloured rectangle buttons: AABB / ABAB / FREE / AAAA / INTERNAL
- `ThemeChips.jsx` + CSS — multi-select chip grid: Place / Love / Transformation / Society / Roots / Duality
- `ReferenceDropZone.jsx` + CSS — textarea that accepts pasted text, shows detected keyword preview
- `PersonaLiveBar.jsx` + CSS — top fixed bar: archetype emoji + name + dominant emotion + language mix

**State persistence:** Use `localStorage` key `sci_cockpit_v2` — auto-save every 2 seconds.

**What Cockpit.jsx should send to `onDone(answers)`:**
```js
{
  whoAreYouNot:   string,   // checkboxes joined
  mainIdea:       string,
  emotionalTruth: string,
  socialConflict: string,
  referenceText:  string,
  // cockpit overrides (sent as separate 'overrides' key to /api/analyze)
  overrides: {
    rawness:      number,   // 0–100
    energyValue:  number,   // 0–100
    rhymeScheme:  string,   // 'AABB'|'ABAB'|'FREE'|'AAAA'|'INTERNAL'
    perspective:  string,   // '1st'|'2nd'|'3rd'
    languageMix:  string[], // ['en','sw','sh']
    traitWeights: { poetic, streetwise, spiritual, wounded }, // 0–100 each
    archetype:    string|null,  // null = auto-detect
    subThemes:    string[],
  }
}
```

---

### 🔲 Priority 2 — CockpitPreview.jsx (cinematic persona reveal)
**File to create:** `frontend/src/pages/CockpitPreview.jsx` + CSS

Full-screen cinematic sequence:
1. Black screen → archetype name fades in (Bebas Neue, 72px, `text-shadow: 0 0 20px var(--green)`)
2. Core message appears below in italic
3. Structure plan slides up from bottom
4. Single `GENERATE →` button — no back, commit mode

This page receives `{ answers, overrides }` from Cockpit and calls `POST /api/analyze` itself. On analysis complete it calls `onAnalysis(data)`.

---

### 🔲 Priority 3 — Wire Cockpit into App.jsx
Once `Cockpit.jsx` and `CockpitPreview.jsx` exist:

In `frontend/src/App.jsx`, uncomment:
```js
import Cockpit        from './pages/Cockpit'
import CockpitPreview from './pages/CockpitPreview'
```

Replace step 1:
```jsx
{step === 1 && <Cockpit onDone={handleAnswersDone} />}
{step === 2 && <CockpitPreview answers={answers} onAnalysis={handleAnalysisDone} />}
```

---

### 🔲 Priority 4 — Push + Open PR
All commits should land on `v2-cockpit-ml`. Once Cockpit UI is done:

```bash
cd ~/sci-songwriting-engine
source ~/.bashrc
git push origin v2-cockpit-ml
```

Then use `github_create_pull_request`:
- base: `main`
- head: `v2-cockpit-ml`
- title: `v2: Cockpit UI + ML Engine + Green/Magenta Art Theme`

---

## Quality Checklist (From Original Spec)

- [x] Engine: `identityParser` uses ML with graceful fallback
- [x] Engine: `styleMapper` has rawness field
- [x] Engine: `structurePlanner` has emotion-weighted structures + 3 new section types
- [x] Engine: `referenceAnalyzer` module created
- [x] ML: Flask service with `paraphrase-MiniLM-L6-v2` — emotion, conflict, trait, language
- [x] ML: `startup.sh` created
- [x] Backend: `/api/analyze` integrates ML, accepts overrides
- [x] Backend: `/api/section` accepts `seed` for regeneration
- [x] Backend: `/api/save` and `/api/sessions` routes
- [x] Backend: ML service in `npm run dev` via `concurrently`
- [x] Frontend: Green + magenta + B&W theme
- [x] Frontend: Bebas Neue in Google Fonts
- [x] Frontend: CRT scanline texture
- [x] Frontend: Green focus glow on inputs
- [x] Frontend: `SongDisplay` per-section `↺` regenerate button
- [x] Frontend: Session save button in SongDisplay
- [x] Frontend: `App.jsx` has Cockpit TODO stubs ready to uncomment
- [x] Legacy pages marked `@deprecated`
- [ ] **Cockpit.jsx** — 3-panel spatial input interface ← NEXT AGENT
- [ ] **KnobSlider, ArchetypeGrid, LanguageToggle, RhymeSwatch, ThemeChips, ReferenceDropZone, PersonaLiveBar** ← NEXT AGENT
- [ ] **CockpitPreview.jsx** — cinematic persona reveal ← NEXT AGENT
- [ ] **Wire Cockpit into App.jsx** ← NEXT AGENT
- [ ] **Push all + open PR** ← NEXT AGENT

---

## Key File Map

```
sci-songwriting-engine/
├── engine/
│   ├── identityParser.js     ← v2 async + ML (DONE)
│   ├── styleMapper.js        ← v2 rawness field (DONE)
│   ├── structurePlanner.js   ← v2 emotion-weighted + 3 new types (DONE)
│   ├── referenceAnalyzer.js  ← NEW (DONE)
│   ├── personaBuilder.js     ← unchanged
│   ├── messageExtractor.js   ← unchanged
├── ml-service/               ← NEW (DONE)
│   ├── app.py
│   ├── emotion_model.py
│   ├── conflict_model.py
│   ├── trait_model.py
│   ├── language_model.py
│   ├── requirements.txt
│   └── startup.sh
├── backend/
│   └── server.js             ← v2 (DONE)
├── ai/
│   ├── generator.js          ← unchanged
│   └── promptBuilder.js      ← unchanged (needs rawness + reference injection — optional polish)
├── frontend/
│   ├── index.html            ← Bebas Neue added (DONE)
│   └── src/
│       ├── App.jsx           ← v2 stubs (DONE) — uncomment Cockpit when ready
│       ├── styles/global.css ← green/magenta/B&W theme (DONE)
│       ├── pages/
│       │   ├── Cockpit.jsx         ← TODO (NEXT AGENT)
│       │   ├── CockpitPreview.jsx  ← TODO (NEXT AGENT)
│       │   ├── SongDisplay.jsx     ← v2 regen + save (DONE)
│       │   ├── Questionnaire.jsx   ← @deprecated (kept)
│       │   ├── PersonaReview.jsx   ← @deprecated (kept)
│       │   ├── Generator.jsx       ← unchanged
│       │   └── Landing.jsx         ← unchanged
│       └── components/
│           ├── KnobSlider.jsx      ← TODO (NEXT AGENT)
│           ├── ArchetypeGrid.jsx   ← TODO (NEXT AGENT)
│           ├── LanguageToggle.jsx  ← TODO (NEXT AGENT)
│           ├── RhymeSwatch.jsx     ← TODO (NEXT AGENT)
│           ├── ThemeChips.jsx      ← TODO (NEXT AGENT)
│           ├── ReferenceDropZone.jsx ← TODO (NEXT AGENT)
│           ├── PersonaLiveBar.jsx  ← TODO (NEXT AGENT)
│           └── ProgressBar.jsx     ← unchanged
├── docs/
│   ├── AGENT_PROMPT_V2.md    ← full original spec (read this first)
│   ├── AGENT_HANDOFF_V2.md   ← this file
│   ├── architecture.md
│   ├── ideology.md
│   └── contribution.md
└── package.json              ← v2 dev script (DONE)
```

---

## SSH + Git Access for Next Agent

```
Host:    localhost
User:    kamau
Tool:    ssh-shell-mcp
```

```bash
# Confirm branch and status
cd ~/sci-songwriting-engine
git status
git log --oneline -8

# Auth is in ~/.bashrc:
source ~/.bashrc
echo $GITHUB_API_TOKEN   # should print token

# Push after your commits:
git push origin v2-cockpit-ml
```

---

## Helpful Commands

```bash
# Start everything (backend + frontend + ML service)
cd ~/sci-songwriting-engine && npm run dev

# ML service only
bash ml-service/startup.sh
curl -s http://localhost:3002/ml/health

# Test analyze endpoint
curl -s -X POST http://localhost:3001/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{"answers":{"mainIdea":"I refuse to be what they made me","emotionalTruth":"anger and pride"}}' \
  | python3 -m json.tool

# List sessions
curl -s http://localhost:3001/api/sessions | python3 -m json.tool
```

---

*Document generated by Claude (Anthropic) during SCI v2 agent session — 2026-04-04.*
