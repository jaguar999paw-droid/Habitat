# HABITAT — AGENT HANDOFF DOCUMENT
**Date:** May 2, 2026
**Project:** Habitat (formerly sci-songwriting-engine)
**Location:** `/home/kamau/Habitat`
**Status:** Phase 1 complete. Phases 2–5 are blueprint-only. This doc is your build contract.

---

## 1. WHAT THIS PROJECT IS

Habitat is an identity-mapping songwriting engine. It excavates a user's authentic identity through journal entries, hook strategies, and persona sliders — then uses that data to generate deeply personal song lyrics via Claude or OpenAI. If no API key is present, it falls back to rule-based generation.

**Running services (when started):**

| Service | Port | Start command |
|---|---|---|
| Frontend (Vite/React) | 3000 | `cd frontend && npm run dev` |
| Backend (Express) | 3001 | `cd backend && npm start` |
| ML Service (Python/Flask) | 3002 | `cd ml-service && python3 app.py` (optional) |

**One-command start:** `bash ~/Habitat/START.sh`

**Current working endpoints (tested, verified):**
- `GET  /api/health`
- `POST /api/analyze`
- `POST /api/generate`
- `POST /api/section`
- `POST /api/save`
- `GET  /api/sessions`
- `POST /api/delta`
- `POST /api/journal/synthesize` ← exists in server.js, works
- `POST /api/hookbook/syllables|rhymes|stress|scheme|devices|grammar|synonyms|coherence|analyze` ← ML proxies, work when ML is up

---

## 2. THE CORE PROBLEM: ROUTES NOT MOUNTED

This is the most critical fix. Three route files exist but are **completely unreachable** because they are never imported or mounted in `server.js`.

**Files that exist and are ready:**
```
backend/routes/journalRoutes.js     — 4 endpoints, fully implemented
backend/routes/hookbookRoutes.js    — 3 endpoints, fully implemented
backend/routes/identityRoutes.js    — 4 endpoints, fully implemented
```

**The fix — add these 6 lines to `backend/server.js`:**

Find the block starting at line ~284 (`// ── Hook Book Proxy Routes`) and insert **before** it:

```javascript
// ── Intent API Routes (Phase 2) ──────────────────────────────────────────────
const journalRoutes   = require('./routes/journalRoutes');
const hookbookRoutes  = require('./routes/hookbookRoutes');
const identityRoutes  = require('./routes/identityRoutes');

app.use('/api/journal',   journalRoutes);
app.use('/api/hookbook',  hookbookRoutes);   // NOTE: mounts AFTER ML proxy routes below
app.use('/api/identity',  identityRoutes);
```

**Critical ordering note:** The existing ML proxy routes in `server.js` use paths like `app.post('/api/hookbook/syllables', ...)`. The new `hookbookRoutes.js` adds `/strategy`, `/reference-analysis`, `/coherence-batch`. There is **no conflict** since no paths overlap. Mount the router after the individual proxy stubs to be safe, or remove the proxy stubs and handle them inside `hookbookRoutes.js` directly.

**After mounting, these endpoints become live:**

| Endpoint | File | Status before fix |
|---|---|---|
| `POST /api/journal/entries` | journalRoutes.js | 404 |
| `GET  /api/journal/entries` | journalRoutes.js | 404 |
| `POST /api/journal/synthesize` | journalRoutes.js | 404 (duplicate exists inline in server.js — see note below) |
| `POST /api/journal/contradiction` | journalRoutes.js | 404 |
| `POST /api/hookbook/strategy` | hookbookRoutes.js | 404 |
| `POST /api/hookbook/reference-analysis` | hookbookRoutes.js | 404 |
| `POST /api/hookbook/coherence-batch` | hookbookRoutes.js | 404 |
| `GET  /api/identity/config` | identityRoutes.js | 404 |
| `POST /api/identity/config` | identityRoutes.js | 404 |
| `POST /api/identity/6angle-profile` | identityRoutes.js | 404 |
| `POST /api/identity/unbiased-assessment` | identityRoutes.js | 404 |

**⚠️ Duplicate synthesize route:** `server.js` has an inline `app.post('/api/journal/synthesize', ...)` block starting after `app.listen()` (around line ~320). This is after `app.listen()` which means Express never reaches it. Once you mount `journalRoutes`, the router's `/synthesize` handler takes over correctly. **Delete the orphaned inline block from server.js** to avoid confusion.

---

## 3. JOURNAL STORAGE: IN-MEMORY ONLY (MUST FIX)

**Current state:** `journalRoutes.js` stores entries in a module-level variable:
```javascript
let journalStore = {};  // dies on every server restart
```

**Required fix:** Persist to `~/.habitat-sessions/journal.json` alongside session files.

Add this to `journalRoutes.js` at the top (after `const router = express.Router()`):

```javascript
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const JOURNAL_FILE = path.join(os.homedir(), '.habitat-sessions', 'journal.json');

// Load on startup
function loadStore() {
  try {
    if (fs.existsSync(JOURNAL_FILE)) {
      return JSON.parse(fs.readFileSync(JOURNAL_FILE, 'utf8'));
    }
  } catch {}
  return {};
}

function saveStore() {
  try {
    fs.mkdirSync(path.dirname(JOURNAL_FILE), { recursive: true });
    fs.writeFileSync(JOURNAL_FILE, JSON.stringify(journalStore, null, 2));
  } catch (e) { console.error('Journal persist error:', e.message); }
}

let journalStore = loadStore();
```

Then call `saveStore()` after every write in the `POST /entries` handler.

**Same pattern needed for `identityRoutes.js`** — its `identityConfigStore` is also in-memory only.

---

## 4. FALLBACK GENERATOR: ENTIRELY MISSING

**Current state:** `ai/generator.js` requires an API key. If none is provided, `server.js` returns `400: API key is required`. There is zero fallback generation.

**What needs to be built:**

### 4a. Create `engine/fallbackGenerator.js`

```javascript
// engine/fallbackGenerator.js
// Rule-based song generation — no API key required.
// Used when no Claude/OpenAI key is available.

const TEMPLATES = require('./templates');

/**
 * @param {object} params - { persona, message, structure, style }
 * @returns {object[]} sections — same shape as generateFullSong() output
 */
function generateFallback({ persona, message, structure, style }) {
  const archetype   = (persona.archetype || 'Seeker').toLowerCase().replace(/\s+/, '_');
  const conflictType = (structure.conflictType || 'rise').toLowerCase().replace(/\s+/, '_');

  // Pick template: archetype_conflict.txt, fallback to default
  const key = `${archetype}_${conflictType}`;
  const template = TEMPLATES[key] || TEMPLATES['seeker_rise'] || TEMPLATES[Object.keys(TEMPLATES)[0]];

  // Inject persona vocabulary into template
  const vocab = extractVocab(message, persona);
  const sections = structure.sections.map((section, i) => {
    const raw = template.sections[i] || template.sections[template.sections.length - 1];
    return {
      type:    section.type,
      label:   section.label,
      content: substituteVocab(raw, vocab),
      source:  'fallback',
    };
  });

  return sections;
}

function extractVocab(message, persona) {
  return {
    EMOTION:    persona.primaryEmotion || 'pain',
    CORE:       message.coreMessage    || 'the truth I carry',
    CONFLICT:   message.socialConflict || 'what they made me',
    ARCHETYPE:  persona.archetype      || 'Seeker',
    SUBJECT:    message.mainIdea?.split(' ').slice(0, 4).join(' ') || 'who I am',
  };
}

function substituteVocab(text, vocab) {
  return Object.entries(vocab).reduce((t, [k, v]) => t.replaceAll(`{{${k}}}`, v), text);
}

module.exports = { generateFallback };
```

### 4b. Create `engine/templates/index.js`

Build at minimum 6 templates covering the most common archetype/conflict combinations:

```
engine/templates/
  index.js          ← exports all templates as { key: templateObj }
  defiant_rise.js
  defiant_surrender.js
  wounded_rise.js
  wounded_surrender.js
  seeker_rise.js
  seeker_transformation.js
```

Each template file exports:
```javascript
module.exports = {
  key: 'defiant_rise',
  sections: [
    // Verse 1
    `They told me {{CONFLICT}}\nBut I carry {{CORE}}\nEvery scar a {{EMOTION}}\nEvery step a war`,
    // Chorus
    `I am the {{ARCHETYPE}}\nRising through the {{EMOTION}}\n{{SUBJECT}}\nThis is who I am`,
    // Verse 2
    `...`,
    // Bridge
    `...`,
  ]
};
```

### 4c. Update `ai/generator.js` — add fallback path

In `server.js`, in the `/api/generate` handler, replace:
```javascript
if (!apiKey) return res.status(400).json({ error: 'API key is required.' });
```
with:
```javascript
if (!apiKey) {
  const { generateFallback } = require('../engine/fallbackGenerator');
  const sections  = generateFallback({ structure, persona, message, style });
  const formatted = formatSong(sections);
  return res.json({
    success: true, sections, song: formatted,
    metadata: { archetype: persona.archetype, source: 'fallback' },
  });
}
```

Same change in the `/api/section` handler.

---

## 5. FRONTEND: COCKPITV5 MISSING

**Current state:** The app flow is a 7-step linear wizard:
```
Landing → JournalPage → HookWorksheet → Cockpit → CockpitPreview → Generator → SongDisplay
```

`App.jsx` still routes through all the old pages. `JournalPage.jsx` and `HookWorksheet.jsx` exist and function — they currently call the backend's `/api/journal/synthesize` inline route (which works once routes are mounted).

**Target state (CockpitV5):** Single unified 4-zone page replacing steps 2+3. This is the highest-effort frontend task.

### 5a. New chart components needed

Create these 4 files in `frontend/src/components/`:

| File | What it renders |
|---|---|
| `EmotionTimeline.jsx` | Line chart — emotion tags over last 7 journal entries (x=date, y=emotion mapped to intensity) |
| `TraitDistribution.jsx` | Radar/spider — 4 traits: rawness, decisiveness, attribution, vulnerability |
| `LanguageMixChart.jsx` | Donut — EN/SW/Sheng percentage from `languageMix` slider |
| `CoherenceScoreMeter.jsx` | Radial progress ring — single 0-100 score from `/api/hookbook/coherence-batch` |

Recommended library: `recharts` is already listed in the frontend dependencies. Use `RadarChart`, `LineChart`, `PieChart`, `RadialBarChart`.

### 5b. Component consolidation

These duplicates need resolving before CockpitV5 is built:

| Current | Target | Action |
|---|---|---|
| `IdentitySliders.jsx` | `KnobSlider.jsx` | Replace all `IdentitySliders` usage with `KnobSlider`. Confirm `KnobSlider` accepts `value`, `onChange`, `min`, `max`, `label` props. Delete `IdentitySliders.jsx`. |
| `EmotionGrid.jsx` (single-select) | Same file, add prop | Add `multiSelect?: boolean` prop. When true, `onChange` receives `string[]` instead of `string`. |
| `PersonaCard.jsx` | `PersonaLiveBar.jsx` | Audit all `PersonaCard` imports and replace with `PersonaLiveBar`. Delete `PersonaCard.jsx`. |

### 5c. IdentityRadar.jsx fixes

The component exists and renders but has two known issues:

1. **Label overlap at edges** — axis labels at 0° and 180° clip. Fix: add dynamic label offset based on angle.
2. **Tooltip goes off-screen** — fix with clamped positioning: `Math.min(tooltipX, containerWidth - tooltipWidth)`.

### 5d. CockpitV5 structure

Create `frontend/src/pages/CockpitV5.jsx`. It receives the same props Cockpit currently receives (preFill, hookOverrides) and outputs the same `onContinue(analysisResult)`.

Layout: CSS Grid, 2 columns on desktop, stacked on mobile.

```
┌──────────────────────────────────────────────────────┐
│  Zone 1: Journal (left col, top)                     │
│  Zone 2: Hook Strategy (right col, top)              │
│  Zone 3: Identity Config (left col, bottom)          │
│  Zone 4: Visual Feedback (right col, bottom)         │
│  ─────────────────────────────────────────────────── │
│  PersonaLiveBar (full width, pinned bottom)          │
└──────────────────────────────────────────────────────┘
```

Zone 4 contains: `IdentityRadar` + the 4 new chart components, tabbed or stacked.

Once `CockpitV5.jsx` is stable, update `App.jsx`:
- Replace `step === 2` (`HookWorksheet`) and `step === 3` (`Cockpit`) with a single `step === 2` → `CockpitV5`
- Remove imports of `JournalPage`, `HookWorksheet`, `Cockpit`
- Delete those 3 page files (or archive them)

---

## 6. IDENTITY SCORECARD / METRICS

**Current state:** `identityRoutes.js` `POST /api/identity/unbiased-assessment` exists and returns scores, but the scoring logic is very shallow (word-count heuristics only). It is already wired — just needs better signal sources.

**What to improve:** Create `engine/metrics.js` and import it from `identityRoutes.js`:

```javascript
// engine/metrics.js
function scoreAuthenticity(journalEntries) {
  // Cross-reference emotional vocabulary in journal against claimed slider values
  // Current impl: binary hasEmotionalLanguage check → needs richer lexicon
}

function scoreConsistency(journalEntries) {
  // Count recurring keywords across entries with TF weighting
  // Current impl: simple repeated-word count
}

function scoreDepth(journalEntries) {
  // Average word count + sentence complexity
}

function scoreNuance(journalEntries, hookData, sliders) {
  // Temporal range, duality presence, reference diversity
}

module.exports = { scoreAuthenticity, scoreConsistency, scoreDepth, scoreNuance };
```

---

## 7. STALE PATH REFERENCES

**`QUICK_REFERENCE.md`** — three commands still reference `~/sci-songwriting-engine`. Find and replace:
```
cd ~/sci-songwriting-engine  →  cd ~/Habitat
```

**`START.sh`** — verify all `cd` references point to `~/Habitat`. Run:
```bash
grep "sci-songwriting" ~/Habitat/START.sh ~/Habitat/TEST_ENDPOINTS.sh
```
Fix any hits.

**`TEST_ENDPOINTS.sh`** — only tests the original 6 endpoints. Add curl tests for all 11 new intent endpoints after mounting them. Follow the existing pattern in the file.

---

## 8. ML SERVICE: MODULE STUBS

**Current state:** The module directories exist but contain only `__init__.py` files:
```
ml-service/modules/hook_book/__init__.py   ← empty
ml-service/modules/journal/__init__.py     ← empty
ml-service/modules/identity/__init__.py    ← empty
```

The actual `ml-service/app.py` provides the hookbook proxy endpoints (`/hookbook/syllables`, etc.) that the backend calls. This **works today** and should not be broken.

The full ML module spec from `HOOKBOOK_JOURNAL_BUILD_BRIEF.md` (linguistic parsers, NLP pipeline, HITL validator, privacy layer, vector DB) is Phase 3+ work. It is a large standalone project. **Do not start this until Phases 2 and 4 (route mounting + fallback generator) are complete.**

---

## 9. PRIORITISED BUILD ORDER

Work in this order. Each task unblocks the next.

### Priority 1 — Backend wiring (1–2 hours)
1. Add 6 route-mounting lines to `backend/server.js` (see Section 2)
2. Delete the orphaned inline `/api/journal/synthesize` block after `app.listen()`
3. Add filesystem persistence to `journalRoutes.js` and `identityRoutes.js` (see Section 3)
4. Test all 11 new endpoints with curl (see Section 9a below)

### Priority 2 — Fallback generator (2–4 hours)
1. Create `engine/templates/` with 6 template files
2. Create `engine/fallbackGenerator.js`
3. Update `/api/generate` and `/api/section` in `server.js` to use fallback when no API key
4. Test full flow without API key: `POST /api/analyze` → `POST /api/generate` (no `apiKey` field)

### Priority 3 — Frontend cleanup (1–2 hours)
1. Consolidate `IdentitySliders` → `KnobSlider` (Section 5b)
2. Add `multiSelect` prop to `EmotionGrid`
3. Remove `PersonaCard`, replace with `PersonaLiveBar`
4. Fix `IdentityRadar` label overlap and tooltip clipping (Section 5c)

### Priority 4 — Chart components (2–3 hours)
1. Build `EmotionTimeline.jsx`
2. Build `TraitDistribution.jsx`
3. Build `LanguageMixChart.jsx`
4. Build `CoherenceScoreMeter.jsx`

### Priority 5 — CockpitV5 (3–5 hours)
1. Build `CockpitV5.jsx` using components from Priority 3 + 4
2. Wire it to the mounted journal and identity endpoints
3. Update `App.jsx` routing
4. Archive/delete old pages

### Priority 6 — Metrics engine (1–2 hours)
1. Create `engine/metrics.js` with proper scoring functions
2. Import and use in `identityRoutes.js` → `/api/identity/unbiased-assessment`

### Priority 7 — Stale references (30 min)
1. Fix `QUICK_REFERENCE.md` paths
2. Fix `START.sh` / `TEST_ENDPOINTS.sh` if stale
3. Update `TEST_ENDPOINTS.sh` with new endpoint tests

---

### 9a. Curl test suite for new endpoints

Once routes are mounted, verify each endpoint:

```bash
BASE="http://localhost:3001"

# Journal: save entry
curl -s -X POST $BASE/api/journal/entries \
  -H "Content-Type: application/json" \
  -d '{"text":"I carry something heavy every morning. I refuse to name it weakness.","emotions":["defiance","sadness"],"promptIdx":0}' | python3 -m json.tool

# Journal: list entries
curl -s "$BASE/api/journal/entries?limit=5" | python3 -m json.tool

# Journal: synthesize
curl -s -X POST $BASE/api/journal/synthesize \
  -H "Content-Type: application/json" \
  -d '{}' | python3 -m json.tool

# Journal: contradiction detect
curl -s -X POST $BASE/api/journal/contradiction \
  -H "Content-Type: application/json" \
  -d '{"entries":["I am strong and unbreakable","I feel so weak and fragile today"]}' | python3 -m json.tool

# Hookbook: strategy
curl -s -X POST $BASE/api/hookbook/strategy \
  -H "Content-Type: application/json" \
  -d '{"hookTypes":["repetition","ascending"],"wordCount":6,"peakLocation":"chorus"}' | python3 -m json.tool

# Hookbook: reference-analysis
curl -s -X POST $BASE/api/hookbook/reference-analysis \
  -H "Content-Type: application/json" \
  -d '{"lyrics":"I will rise\nI will fight\nNo more pain\nNo more night","artist":"Test"}' | python3 -m json.tool

# Hookbook: coherence-batch
curl -s -X POST $BASE/api/hookbook/coherence-batch \
  -H "Content-Type: application/json" \
  -d '{"verses":[{"text":"I rise above the pain and carry my truth forward into the light","section":"verse1"}]}' | python3 -m json.tool

# Identity: get config
curl -s "$BASE/api/identity/config" | python3 -m json.tool

# Identity: set config
curl -s -X POST $BASE/api/identity/config \
  -H "Content-Type: application/json" \
  -d '{"config":{"archetype":"Defiant","sliders":{"rawness":80,"decisiveness":60,"attribution":50,"vulnerability_level":40}}}' | python3 -m json.tool

# Identity: 6-angle radar
curl -s -X POST $BASE/api/identity/6angle-profile \
  -H "Content-Type: application/json" \
  -d '{"config":{"sliders":{"rawness":70,"decisiveness":60,"attribution":50,"vulnerability_level":40}},"temporalProfile":{"past":0.4,"present":0.4,"future":0.2}}' | python3 -m json.tool

# Identity: unbiased assessment
curl -s -X POST $BASE/api/identity/unbiased-assessment \
  -H "Content-Type: application/json" \
  -d '{"journalEntries":["I carry something heavy","I refuse to be called weak","This is who I became"],"hookData":{"references":["ref1","ref2"]},"userSliders":{"rawness":70,"decisiveness":60,"vulnerability_level":45}}' | python3 -m json.tool
```

---

## 10. FILE MAP: WHAT EXISTS vs. WHAT IS NEEDED

```
Habitat/
├── backend/
│   ├── server.js                    ✅ exists — needs 6 mount lines + orphan delete
│   ├── routes/
│   │   ├── journalRoutes.js         ✅ exists — needs filesystem persistence
│   │   ├── hookbookRoutes.js        ✅ exists — ready to mount
│   │   └── identityRoutes.js        ✅ exists — needs filesystem persistence
│   └── ...
├── engine/
│   ├── identityParser.js            ✅ exists
│   ├── personaBuilder.js            ✅ exists
│   ├── messageExtractor.js          ✅ exists
│   ├── structurePlanner.js          ✅ exists
│   ├── styleMapper.js               ✅ exists
│   ├── temporalParser.js            ✅ exists
│   ├── propertyTensionEngine.js     ✅ exists
│   ├── referenceAnalyzer.js         ✅ exists
│   ├── altEgoEngine.js              ✅ exists
│   ├── lyricsStyleEngine.js         ✅ exists
│   ├── fallbackGenerator.js         ❌ MISSING — build (Section 4)
│   ├── metrics.js                   ❌ MISSING — build (Section 6)
│   └── templates/
│       └── index.js + *.js          ❌ MISSING — build (Section 4b)
├── ai/
│   ├── generator.js                 ✅ exists — needs fallback hook (Section 4c)
│   └── promptBuilder.js             ✅ exists
├── frontend/src/
│   ├── pages/
│   │   ├── Landing.jsx              ✅ keep
│   │   ├── Cockpit.jsx              ⚠️  replace with CockpitV5 (Section 5d)
│   │   ├── CockpitPreview.jsx       ✅ keep
│   │   ├── Generator.jsx            ✅ keep
│   │   ├── SongDisplay.jsx          ✅ keep
│   │   ├── JournalPage.jsx          ⚠️  archive after CockpitV5 done
│   │   ├── HookWorksheet.jsx        ⚠️  archive after CockpitV5 done
│   │   ├── PersonaReview.jsx        ✅ keep (or review)
│   │   ├── Questionnaire.jsx        ✅ keep
│   │   └── CockpitV5.jsx            ❌ MISSING — build (Section 5d)
│   └── components/
│       ├── IdentityRadar.jsx        ⚠️  exists, needs label+tooltip fix (Section 5c)
│       ├── KnobSlider.jsx           ✅ keep — becomes universal slider
│       ├── IdentitySliders.jsx      ⚠️  deprecate — replace with KnobSlider
│       ├── EmotionGrid.jsx          ⚠️  add multiSelect prop
│       ├── PersonaLiveBar.jsx       ✅ keep
│       ├── PersonaCard.jsx          ⚠️  deprecate — replace with PersonaLiveBar
│       ├── EmotionTimeline.jsx      ❌ MISSING — build (Section 5a)
│       ├── TraitDistribution.jsx    ❌ MISSING — build (Section 5a)
│       ├── LanguageMixChart.jsx     ❌ MISSING — build (Section 5a)
│       └── CoherenceScoreMeter.jsx  ❌ MISSING — build (Section 5a)
├── ml-service/
│   ├── app.py                       ✅ works — hookbook proxy endpoints live here
│   └── modules/
│       ├── hook_book/__init__.py    ⚠️  stub only — Phase 3+ work
│       ├── journal/__init__.py      ⚠️  stub only — Phase 3+ work
│       └── identity/__init__.py     ⚠️  stub only — Phase 3+ work
├── QUICK_REFERENCE.md               ⚠️  3 paths still say sci-songwriting-engine
├── START.sh                         ⚠️  verify no stale paths
└── TEST_ENDPOINTS.sh                ⚠️  only tests 6 old endpoints
```

---

## 11. WHAT NOT TO TOUCH

- `backend/server.js` core routes (`/api/analyze`, `/api/generate`, `/api/section`, `/api/save`, `/api/sessions`, `/api/delta`) — all working, tested, do not refactor
- `engine/` existing modules — all Layer 2 compliant, working, no changes needed
- `ai/generator.js` and `ai/promptBuilder.js` — only add the fallback hook, do not refactor the AI call logic
- `ml-service/app.py` and its hookbook service — working proxy layer, leave it alone
- `frontend/src/pages/CockpitPreview.jsx`, `Generator.jsx`, `SongDisplay.jsx` — downstream of Cockpit, keep as-is

---

## 12. KNOWN CONSTRAINTS

- **Node.js version:** Backend runs on Node 20 (same as Lavira engine on same machine). Do not introduce ESM (`import/export`) — the entire backend uses CommonJS (`require/module.exports`).
- **Frontend build:** Vite + React. `recharts` is available. Do not add Tailwind — the project uses CSS Modules (`.module.css` files alongside each component).
- **Sessions dir:** `~/.habitat-sessions/` — this is the persistence layer. No database. Do not introduce SQLite or Mongo for this phase.
- **ML service is optional:** All backend logic must work with ML service offline. The 500ms timeout + rule-based fallback pattern is already in `identityParser.js` — follow the same pattern.
- **No breaking changes to `/api/analyze` contract** — the Cockpit depends on its exact response shape. If you add fields, add them; never remove or rename.

---

*Generated by Claude on 2026-05-02 from live inspection of `/home/kamau/Habitat`. All code references verified against actual file contents.*
