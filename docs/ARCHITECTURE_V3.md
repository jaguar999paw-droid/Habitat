# SCI Architecture — v3

> *"Every structure carries the spirit of its maker."*

## Overview

SCI v3 is a full-stack AI songwriting application built around the principle of **identity excavation**.

The v3 architecture introduces three new philosophical layers:
1. **Duality Engine** — reasoning on what is AND what is not
2. **Studio Engine** — Gen-Z practice modes (cypher, battle, analysis, juxtaposition)
3. **Default Persona Data** — rich, culturally grounded defaults

---

## Application Flow (v3)

```
Landing (API key + provider setup)
    ↓
CockpitHub (non-sequential, unified input)
  ├── Core input zone (with optional duality shadow fields)
  ├── OPTIONAL PANELS (accessible anytime, non-sequential):
  │   ├── Hook Book (rough drafts, rhyme, borrowed lines)
  │   ├── Journal (persona excavation, questionnaire, synthesis)
  │   ├── Studio (cypher, battle, analyze, juxtapose)
  │   └── Manual Config (PIRE, duality, identity deep-config)
  └── Craft strip (archetype, energy, rhyme, language — always visible)
    ↓
CockpitPreview (cinematic persona reveal)
    ↓
Generator (section-by-section AI generation)
    ↓
SongDisplay (song + HookBook drawer + export)
```

---

## Layer Architecture

### Layer 1 — Engine (Pure JavaScript)

| Module | Purpose | Key Exports |
|---|---|---|
| `identityParser.js` | Parse identity from text (ML + rule-based) | `parseIdentity`, `parseIdentitySync` |
| `personaBuilder.js` | Build structured persona from parsed identity | `buildPersona` |
| `messageExtractor.js` | Extract core message + temporal profile | `extractMessage` |
| `structurePlanner.js` | Plan song structure from persona + message | `planStructure` |
| `styleMapper.js` | Map persona to style rules | `mapStyle` |
| `referenceAnalyzer.js` | Extract rhyme/vocab from reference lyrics | `analyzeReference` |
| `temporalParser.js` | PIRE: past/present/future + logical relations | `parseTemporalIdentity` |
| `identityConfig.js` | 6-Angle identity framework (v1) | `buildIdentityFrameBlock` |
| `altEgoEngine.js` | Alter ego persona masks | `buildAlterEgoBlock` |
| `propertyTensionEngine.js` | Cross-property tension detection | `detectPropertyTensions` |
| **`dualityEngine.js`** ✨NEW | What vs What-Not duality reasoning | `analyzeDuality`, `buildDualityBlock` |
| **`studioEngine.js`** ✨NEW | Gen-Z studio mode prompt builders | `buildCypherPrompt`, `buildBattlePrompt`, etc. |
| **`defaultPersonaData.js`** ✨NEW | Rich defaults + Gen-Z archetypes | `GENZ_ARCHETYPES`, `RICH_DEFAULT_IDENTITY_CONFIG` |

### Layer 2 — AI Layer

| Module | Purpose |
|---|---|
| `ai/promptBuilder.js` | Section-level structured prompts + PIRE + Duality |
| `ai/generator.js` | Claude / OpenAI abstraction, section-by-section generation |

### Layer 3 — Backend (Express)

**Core routes:**
- `POST /api/analyze` — Full identity parse + persona build
- `POST /api/generate` — Full song generation
- `POST /api/section` — Single section generate / regenerate
- `POST /api/save` — Save session to disk
- `GET  /api/sessions` — List saved sessions
- `POST /api/delta` — Compare session deltas
- `GET  /api/health` — Health check

**Studio routes (v3 NEW):**
- `POST /api/studio/cypher` — Fast-flow bar generation
- `POST /api/studio/battle` — Battle rap opener/responder
- `POST /api/studio/analyze-lyrics` — Lyric analysis + message extraction
- `POST /api/studio/juxtapose` — Identity juxtaposition
- `POST /api/duality` — Duality analysis

**Hook Book routes:**
- `POST /api/hookbook/syllables` — Syllable count
- `POST /api/hookbook/rhymes` — Rhyme suggestions
- `POST /api/hookbook/stress` — Stress pattern + meter
- `POST /api/hookbook/scheme` — Rhyme scheme detection
- `POST /api/hookbook/devices` — Literary device detection
- `POST /api/hookbook/grammar` — Grammar intelligence
- `POST /api/hookbook/synonyms` — Songwriting synonyms
- `POST /api/hookbook/coherence` — Verse coherence score
- `POST /api/hookbook/analyze` — Full Hook Book analysis

**Journal routes:**
- `POST /api/journal/synthesize` — AI/rule-based journal synthesis

### Layer 4 — Frontend (React/Vite)

**Pages:**
| File | Purpose |
|---|---|
| `Landing.jsx` | API key setup, provider selection, hero |
| **`CockpitHub.jsx`** ✨NEW | Unified non-sequential cockpit + optional panels |
| `CockpitPreview.jsx` | Cinematic persona reveal |
| `Generator.jsx` | Section-by-section generation |
| `SongDisplay.jsx` | Final song + HookBook drawer |

**Removed from main flow (now integrated as panels):**
- `JournalPage.jsx` → Journal panel inside CockpitHub
- `HookWorksheet.jsx` → Hook Book panel inside CockpitHub
- `Cockpit.jsx` (4-phase) → Replaced by CockpitHub

**Key new components:**
- **`DualityInput.jsx`** ✨NEW — Dual what/what-not text field

### Layer 5 — ML Microservice (Python, port 3002)

- `ml-service/app.py` — Flask server
- `emotion_model.py` — Cosine similarity emotion detection
- `conflict_model.py` — Conflict archetype classification
- `trait_model.py` — Trait scoring
- `language_model.py` — Language detection (EN/SW/Sheng)
- `hookbook_service.py` — Syllables, rhymes, stress, devices

---

## Separation of Concerns

| Concern | Owned By | Notes |
|---|---|---|
| Identity parsing | `identityParser.js` | Async ML + rule-based fallback |
| Persona construction | `personaBuilder.js` | Pure function, no side effects |
| Message extraction | `messageExtractor.js` | Reads parsed identity, no I/O |
| Structure planning | `structurePlanner.js` | Deterministic, 8 conflict templates |
| Style mapping | `styleMapper.js` | Maps persona → AI style rules |
| Temporal reasoning | `temporalParser.js` | PIRE layer, Square of Opposition |
| Duality reasoning | `dualityEngine.js` | What vs What-Not, shadow mapping |
| Studio modes | `studioEngine.js` | Prompt builders only, no I/O |
| AI generation | `generator.js` | Provider abstraction (Claude / OpenAI) |
| Prompt construction | `promptBuilder.js` | Composes all engine outputs into prompts |
| API layer | `backend/server.js` | Route handlers + proxy to ML |
| UI state | Component-level + localStorage | No Redux needed at current scale |

---

## Security Notes

- API keys are passed from frontend to backend per-request — never stored server-side
- Sessions are stored in `~/.sci-sessions/` (local only)
- ML service is local-only (port 3002, no external exposure)
- CORS allows all origins in dev — restrict in production via `ALLOWED_ORIGINS` env var

---

## Extension Points

To add a new **language**: Add to `identityParser.js` lexicon, `styleMapper.js` language map, `LanguageToggle.jsx`

To add a new **archetype**: Add to `personaBuilder.js` `ARCHETYPE_MAP`, `ArchetypeGrid.jsx`

To add a new **studio mode**: Add prompt builder to `studioEngine.js`, route to `server.js`, UI to `StudioPanel` in `CockpitHub.jsx`

To add a new **alter ego**: Add to `altEgoEngine.js` and `ALTER_EGO_OPTIONS` in `CockpitHub.jsx`

To add a new **section type**: Add to `structurePlanner.js` templates, `temporalParser.js` SECTION_TEMPORAL_MAP

---
*SCI Architecture v3 — 2026-04*
